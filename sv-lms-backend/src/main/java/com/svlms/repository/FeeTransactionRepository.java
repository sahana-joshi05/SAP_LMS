package com.svlms.repository;

import com.svlms.entity.Fee;
import com.svlms.entity.FeeTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeeTransactionRepository extends JpaRepository<FeeTransaction, Long> {
    List<FeeTransaction> findByFee(Fee fee);
}
