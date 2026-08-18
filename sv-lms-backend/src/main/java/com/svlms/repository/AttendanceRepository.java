package com.svlms.repository;

import com.svlms.entity.Attendance;
import com.svlms.entity.Batch;
import com.svlms.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByBatchOrderBySessionDateDesc(Batch batch);
    List<Attendance> findByStudentOrderBySessionDateDesc(Student student);
    Optional<Attendance> findByBatchAndStudentAndSessionDate(Batch batch, Student student, LocalDate sessionDate);
}
