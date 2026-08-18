package com.svlms.repository;

import com.svlms.entity.Receipt;
import com.svlms.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ReceiptRepository extends JpaRepository<Receipt, Long> {
    List<Receipt> findByStudentOrderByIssuedDateDesc(Student student);
    Optional<Receipt> findByReceiptNumber(String receiptNumber);
    List<Receipt> findAllByOrderByIssuedDateDesc();
}
