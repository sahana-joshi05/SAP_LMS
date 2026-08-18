package com.svlms.repository;

import com.svlms.entity.Lead;
import com.svlms.entity.Student;
import com.svlms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUser(User user);
    Optional<Student> findByUserId(Long userId);
    Optional<Student> findByLead(Lead lead);
}
