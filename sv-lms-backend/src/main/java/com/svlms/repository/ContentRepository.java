package com.svlms.repository;

import com.svlms.entity.Batch;
import com.svlms.entity.Content;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContentRepository extends JpaRepository<Content, Long> {
    List<Content> findByBatchOrderByUploadedAtDesc(Batch batch);
}
