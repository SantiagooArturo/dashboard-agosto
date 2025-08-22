import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Chip } from '@heroui/chip';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { activationAnalyticsService } from '@/services/activationAnalytics';

type UniversityRow = {
  university: string;
  users: number;
  percentage: number;
};

type SortKey = 'users' | 'percentage' | 'name';

const UniversitiesPage: React.FC = () => {
  const [rows, setRows] = useState<UniversityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Controles
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('users');
  const [limit, setLimit] = useState<number>(25);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const dist = await activationAnalyticsService.getUniversityDistribution();
        setRows(dist);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalUsers = useMemo(() => rows.reduce((s, r) => s + r.users, 0), [rows]);
  const totalUniversities = rows.length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(r => r.university.toLowerCase().includes(q));
  }, [rows, query]);

  const sorted = useMemo(() => {
    const clone = [...filtered];
    if (sortBy === 'users') clone.sort((a, b) => b.users - a.users);
    else if (sortBy === 'percentage') clone.sort((a, b) => b.percentage - a.percentage);
    else clone.sort((a, b) => a.university.localeCompare(b.university));
    return clone;
  }, [filtered, sortBy]);

  const visible = useMemo(() => (showAll ? sorted : sorted.slice(0, limit)), [sorted, showAll, limit]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando distribución por universidad...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <Card className="max-w-md mx-auto border-l-4 border-l-red-500">
          <CardBody>
            <p className="text-red-600">{error}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const topCoverage = Math.min(10, sorted.length) > 0
    ? (sorted.slice(0, 10).reduce((s, r) => s + r.users, 0) / Math.max(1, totalUsers)) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header y KPIs */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Universidades</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Distribución de estudiantes por universidad (solo lectura)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardBody>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total estudiantes</p>
              <p className="text-2xl font-bold">{totalUsers.toLocaleString()}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-500 dark:text-gray-400">Universidades detectadas</p>
              <p className="text-2xl font-bold">{totalUniversities.toLocaleString()}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cobertura Top 10</p>
              <p className="text-2xl font-bold">{topCoverage.toFixed(1)}%</p>
            </CardBody>
          </Card>
        </div>

        {/* Controles */}
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="Buscar universidad"
                placeholder="Escribe para filtrar..."
                value={query}
                onValueChange={setQuery}
              />

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">Ordenar por</label>
                <select
                  className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                >
                  <option value="users">Estudiantes (desc)</option>
                  <option value="percentage">Porcentaje (desc)</option>
                  <option value="name">A-Z</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">Mostrar</label>
                <select
                  className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2"
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                  disabled={showAll}
                >
                  <option value={10}>Top 10</option>
                  <option value={25}>Top 25</option>
                  <option value={50}>Top 50</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button onClick={() => setShowAll((v) => !v)}>
                  {showAll ? 'Ver top' : 'Ver todo'}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Chart */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Estudiantes por Universidad</h2>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={450}>
              <BarChart data={visible} layout="vertical" margin={{ left: 40, right: 24, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="university" width={220} />
                <Tooltip formatter={(value: any, name: string) => [
                  name === 'users' ? `${value} estudiantes` : `${value.toFixed(1)}%`,
                  name === 'users' ? 'Estudiantes' : 'Porcentaje'
                ]} />
                <Bar dataKey="users" fill="#3B82F6" name="users" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Tabla */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Detalle</h2>
          </CardHeader>
          <CardBody>
            <div className="overflow-auto max-h-[520px]">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800 z-10">
                  <tr>
                    <th className="text-left px-3 py-2">Universidad</th>
                    <th className="text-right px-3 py-2">Estudiantes</th>
                    <th className="text-right px-3 py-2">Porcentaje</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row) => (
                    <tr key={row.university} className="border-b border-gray-100/10">
                      <td className="px-3 py-2">{row.university}</td>
                      <td className="px-3 py-2 text-right">{row.users.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">
                        <Chip size="sm" color="primary" variant="flat">
                          {row.percentage.toFixed(1)}%
                        </Chip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default UniversitiesPage;


