package com.scribo.repository;

import com.scribo.model.Note;
import com.scribo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByOwnerOrderByLastUpdatedDesc(User owner);

    @Query("SELECT n FROM Note n WHERE n.owner = :user " +
           "OR EXISTS (SELECT s FROM SharedNote s WHERE s.note = n AND s.sharedUser = :user) " +
           "ORDER BY n.lastUpdated DESC")
    List<Note> findAllAccessibleByUser(User user);
}
