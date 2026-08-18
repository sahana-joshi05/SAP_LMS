package com.svlms.repository;

import com.svlms.entity.Batch;
import com.svlms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BatchRepository extends JpaRepository<Batch, Long> {
    List<Batch> findByTrainerOrderByCreatedAtDesc(User trainer);
    List<Batch> findAllByOrderByCreatedAtDesc();
}
