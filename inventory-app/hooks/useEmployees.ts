import { API_URL } from "@/constants/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState, useCallback } from "react";

interface Employee {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
}

export function useEmployees() {
  const user = useAuthStore((state) => state.user);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch all employees
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/api/employees/get-all`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch employees");

      const data = await res.json();
      setEmployees(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addEmployee = useCallback(
    async (newEmployee: { name: string; email: string; password: string }) => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/employees/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify(newEmployee),
        });
        if (!res.ok) throw new Error("Failed to add employee");

        await fetchEmployees(); // refresh list
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [fetchEmployees]
  );

  const editEmployee = useCallback(
    async (updatedEmployee: {
      id: string;
      name?: string;
      email?: string;
      password?: string;
    }) => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/employees/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify(updatedEmployee),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to update employee");
        }

        const data = await res.json();

        // Update local state
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === data.employee.id ? data.employee : emp))
        );
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [user?.token]
  );

  const deleteEmployee = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/employees/delete`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ id }),
        });
        if (!res.ok) throw new Error("Failed to delete employee");

        // Optimistic update (remove locally)
        setEmployees((prev) => prev.filter((emp) => emp.id !== id));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [user?.token]
  );

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    addEmployee,
    deleteEmployee,
    editEmployee,
  };
}
