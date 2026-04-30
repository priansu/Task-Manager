import { useEffect, useState, useContext } from "react";
import API from "../api";
import { AuthContext } from "../context/AuthContext.js";
import TaskModal from "../components/TaskModal";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const { user, logout } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [users, setUsers] = useState([]);

  const toggleStatus = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === "Done" ? "Todo" : "Done";
      await API.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      alert("Failed to update status: " + (err.response?.data?.message || "Request failed"));
    }
  };

  const deleteTask = async (taskId) => {
    const shouldDelete = window.confirm("Delete this task?");
    if (!shouldDelete) return;

    try {
      await API.delete(`/tasks/${taskId}`);
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task._id !== taskId)
      );
    } catch (err) {
      alert("Failed to delete task: " + (err.response?.data?.message || "Request failed"));
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const fetchTasks = async () => {
    try {
      const { data } = await API.get("/tasks");
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks", err);
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      const { data } = await API.patch(`/auth/users/${userId}/role`, { role });
      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser._id === data._id ? data : currentUser
        )
      );
    } catch (err) {
      alert("Failed to update role: " + (err.response?.data?.message || "Request failed"));
    }
  };

  useEffect(() => {
    let ignore = false;

    API.get("/tasks")
      .then(({ data }) => {
        if (!ignore) setTasks(data);
      })
      .catch((err) => {
        console.error("Error fetching tasks", err);
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (user?.role !== "Admin") return undefined;

    let ignore = false;

    API.get("/auth/users")
      .then(({ data }) => {
        if (!ignore) setUsers(data);
      })
      .catch((err) => {
        console.error("Error fetching users", err);
      });

    return () => {
      ignore = true;
    };
  }, [user?.role]);

  // Stats calculation
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "Done").length,
    overdue: tasks.filter((t) => t.status === "Overdue").length,
    pending: tasks.filter((t) => t.status !== "Done" && t.status !== "Overdue").length,
  };

  const canUpdateTask = (task) =>
    user?.role === "Admin" || task.assignedTo?._id === user?._id;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Team Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
            {user?.role}: {user?.name}
          </span>
          <button onClick={logout} className="text-red-600 hover:underline">
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Total Tasks</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Completed</p>
          <p className="text-2xl font-bold">{stats.completed}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="text-2xl font-bold">{stats.pending}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
          <p className="text-gray-500 text-sm">Overdue</p>
          <p className="text-2xl font-bold">{stats.overdue}</p>
        </div>
      </div>

      {/* Role-Based Action: Admin Only */}
      {user?.role === "Admin" && (
        <button
          onClick={openCreateModal}
          className="mb-6 bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700"
        >
          + Create New Task
        </button>
      )}
      <TaskModal
        key={editingTask?._id || "create-task"}
        isOpen={isModalOpen}
        onClose={closeTaskModal}
        onTaskSaved={fetchTasks}
        task={editingTask}
      />

      {user?.role === "Admin" && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-10">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold text-gray-800">User Roles</h2>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((appUser) => (
                <tr key={appUser._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{appUser.name}</td>
                  <td className="p-4 text-gray-600">{appUser.email}</td>
                  <td className="p-4">
                    <select
                      value={appUser.role}
                      disabled={appUser._id === user?._id}
                      onChange={(e) => updateUserRole(appUser._id, e.target.value)}
                      className="border rounded px-2 py-1 disabled:bg-gray-100 disabled:text-gray-500"
                    >
                      <option value="Member">Member</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Task List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Assigned To</th>
              <th className="p-4">Status</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task._id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{task.title}</td>
                <td className="p-4 text-gray-600">
                  {task.assignedTo?.name || "Unassigned"}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      task.status === "Done"
                        ? "bg-green-100 text-green-700"
                        : task.status === "Overdue"
                          ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {task.status}
                  </span>
                </td>
                <td className="p-4 text-gray-500">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "No date"}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {canUpdateTask(task) ? (
                      <button
                        onClick={() => toggleStatus(task._id, task.status)}
                        className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                      >
                        {task.status === "Done" ? "Undo" : "Mark Done"}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">Not allowed</span>
                    )}
                    {user?.role === "Admin" && (
                      <>
                        <button
                          onClick={() => openEditModal(task)}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTask(task._id)}
                          className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
