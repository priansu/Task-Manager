import { useEffect, useState } from 'react';
import API from '../api';

const formatDateInput = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

const getInitialFormData = (task) => ({
  title: task?.title || '',
  description: task?.description || '',
  dueDate: formatDateInput(task?.dueDate),
  assignedTo: task?.assignedTo?._id || '',
});

const TaskModal = ({ isOpen, onClose, onTaskSaved, task }) => {
  const [formData, setFormData] = useState(() => getInitialFormData(task));
  const [users, setUsers] = useState([]);
  const isEditing = Boolean(task?._id);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const { data } = await API.get('/tasks/users');
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users', err);
      }
    };

    if (isOpen) getUsers();
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await API.patch(`/tasks/${task._id}`, formData);
      } else {
        await API.post('/tasks', formData);
      }
      onTaskSaved();
      onClose();
    } catch (err) {
      alert("Error saving task: " + (err.response?.data?.message || "Request failed"));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold mb-4">
          {isEditing ? 'Edit Task' : 'Create New Task'}
        </h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" placeholder="Task Title" required
            value={formData.title}
            className="w-full p-2 mb-3 border rounded"
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
          <textarea 
            placeholder="Description" 
            value={formData.description}
            className="w-full p-2 mb-3 border rounded"
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          <input 
            type="date" required
            value={formData.dueDate}
            className="w-full p-2 mb-3 border rounded"
            onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
          />
          <select 
            value={formData.assignedTo}
            className="w-full p-2 mb-4 border rounded"
            onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
          >
            <option value="">Select User to Assign</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>{u.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-200 p-2 rounded">Cancel</button>
            <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded">
              {isEditing ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal; 
