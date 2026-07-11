package com.scribo.repository;

import com.scribo.model.Note;
import com.scribo.model.SharedNote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SharedNoteRepository extends JpaRepository<SharedNote, Long> {
    List<SharedNote> findByNote(Note note);
    Optional<SharedNote> findByNoteAndSharedUserId(Note note, Long userId);
    boolean existsByNoteAndSharedUserId(Note note, Long sharedUserId);
}
