package com.svlms.repository;

import com.svlms.entity.Batch;
import com.svlms.entity.BatchStudent;
import com.svlms.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BatchStudentRepository extends JpaRepository<BatchStudent, Long> {
    List<BatchStudent> findByBatch(Batch batch);
    List<BatchStudent> findByStudent(Student student);
    Optional<BatchStudent> findByBatchAndStudent(Batch batch, Student student);
    boolean existsByBatchAndStudent(Batch batch, Student student);
}
