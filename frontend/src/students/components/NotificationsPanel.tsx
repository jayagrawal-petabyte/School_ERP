const NotificationsPanel = () => {
  const notifications = [
    { id: 1, title: "Assignment Deadline", desc: "Math Algebra Ex 4.2 is due tomorrow.", time: "2 hrs ago", icon: "⏰", unread: true },
    { id: 2, title: "Upcoming Exam", desc: "Science Midterm starts in 3 days.", time: "5 hrs ago", icon: "📚", unread: true },
    { id: 3, title: "Attendance Warning", desc: "Your attendance dropped to 92%.", time: "1 day ago", icon: "⚠️", unread: false },
    { id: 4, title: "New Announcement", desc: "School closed on Friday for holiday.", time: "2 days ago", icon: "📢", unread: false },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Notifications</h2>
      <div className="space-y-4">
        {notifications.map((note) => (
          <div key={note.id} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
            <div className="text-2xl mt-1">{note.icon}</div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                {note.title}
                {note.unread && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{note.desc}</p>
              <span className="text-[10px] text-gray-400 mt-1 block">{note.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPanel;
