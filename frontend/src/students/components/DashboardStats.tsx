const DashboardStats = () => {
  const stats = [
    {
      title: "Attendance",
      value: "92%",
    },
    {
      title: "Pending Assignments",
      value: "8",
    },
    {
      title: "Upcoming Exams",
      value: "2",
    },
    {
      title: "CGPA",
      value: "8.9",
    },
  ];

  const valueColor = (title) => {
    switch (title) {
      case "Attendance":
        return "text-blue-600";
      case "Pending Assignments":
        return "text-orange-600";
      case "Upcoming Exams":
        return "text-purple-600";
      case "CGPA":
        return "text-green-600";
      default:
        return "text-gray-800";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((item) => (
        <div
          key={item.title}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md"
        >
          <p className="text-gray-500 text-sm">{item.title}</p>

          <h2 className={`text-3xl font-bold mt-2 ${valueColor(item.title)}`}>
            {item.value}
          </h2>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;