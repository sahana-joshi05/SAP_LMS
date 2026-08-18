package com.svlms.repository;

import com.svlms.entity.Lead;
import com.svlms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeadRepository extends JpaRepository<Lead, Long> {
    List<Lead> findByAssignedCounselorOrderByCreatedAtDesc(User counselor);
    List<Lead> findAllByOrderByCreatedAtDesc();
}
