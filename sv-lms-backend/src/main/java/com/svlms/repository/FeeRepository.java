package com.svlms.repository;

import com.svlms.entity.Fee;
import com.svlms.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeeRepository extends JpaRepository<Fee, Long> {
    List<Fee> findByStudent(Student student);
}
