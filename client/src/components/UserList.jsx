const UserList = ({ users }) => {
  return (
    <div className="user-list p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Online Users ({users.length})</h3>
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.id || user.username} className="flex items-center space-x-2">
            <div className="avatar w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user.username ? user.username.charAt(0).toUpperCase() : '?'}
            </div>
            <span className="username text-gray-700">{user.username}</span>
            <div className="status w-2 h-2 bg-green-500 rounded-full"></div>
          </li>
        ))}
      </ul>
      {users.length === 0 && (
        <p className="text-gray-500 text-sm">No users online</p>
      )}
    </div>
  );
};

export default UserList;