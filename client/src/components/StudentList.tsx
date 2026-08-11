const StudentList = () => {
  return (
    <div>
        <p>Student List</p>
        {[0, 1, 2, 3 ,4, 5].map(s => (
            <p key={s} className="border">Student #{s}</p>
        ))}
    </div>
  )
}

export default StudentList