package com.jaimin.justStore.repository;

import com.jaimin.justStore.model.File;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FileRepository extends JpaRepository<File, Long> {
}
