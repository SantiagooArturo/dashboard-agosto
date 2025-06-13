import { Route, Routes } from "react-router-dom";
import DefaultLayout from "@/layouts/default";
import DashboardPage from "@/pages/dashboard";
import UsersPage from "@/pages/users";
import JobsPage from "@/pages/jobs";
import CVsPage from "@/pages/cvs";
import InterviewsPage from "@/pages/interviews";
import TransactionsPage from "@/pages/transactions";

function App() {
  return (
    <DefaultLayout>
      <Routes>
        <Route element={<DashboardPage />} path="/" />
        <Route element={<UsersPage />} path="/users" />
        <Route element={<JobsPage />} path="/jobs" />
        <Route element={<CVsPage />} path="/cvs" />
        <Route element={<InterviewsPage />} path="/interviews" />
        <Route element={<TransactionsPage />} path="/transactions" />
      </Routes>
    </DefaultLayout>
  );
}

export default App;
