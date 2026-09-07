package com.svlms.repository;

import com.svlms.entity.Lead;
import com.svlms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface LeadRepository extends JpaRepository<Lead, Long> {
    List<Lead> findByAssignedCounselorOrderByCreatedAtDesc(User counselor);
    List<Lead> findAllByOrderByCreatedAtDesc();

    @Query("select l from Lead l where l.assignedCounselor = :counselor or l.assignedCounselor is null order by l.createdAt desc")
    List<Lead> findVisibleToCounselor(@Param("counselor") User counselor);
}
