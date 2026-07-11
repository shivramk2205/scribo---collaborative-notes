package com.scribo.controller;

import com.scribo.model.*;
import com.scribo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteRepository noteRepo;
    private final UserRepository userRepo;
    private final SharedNoteRepository sharedRepo;

    private User currentUser(UserDetails ud) {
        return userRepo.findByUsername(ud.getUsername()).orElseThrow();
    }

    @GetMapping
    public List<Map<String, Object>> getAllNotes(@AuthenticationPrincipal UserDetails ud) {
        User user = currentUser(ud);
        return noteRepo.findAllAccessibleByUser(user).stream().map(n -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", n.getId());
            map.put("title", n.getTitle());
            map.put("content", n.getContent());
            map.put("lastUpdated", n.getLastUpdated());
            map.put("role", n.getOwner().getId().equals(user.getId()) ? "owner" : "shared");
            return map;
        }).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getNote(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        User user = currentUser(ud);
        return noteRepo.findById(id)
            .filter(n -> n.getOwner().getId().equals(user.getId()) || sharedRepo.existsByNoteAndSharedUserId(n, user.getId()))
            .map(n -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", n.getId());
                m.put("title", n.getTitle());
                m.put("content", n.getContent());
                m.put("lastUpdated", n.getLastUpdated());
                m.put("owner", n.getOwner().getId().equals(user.getId()));
                return ResponseEntity.ok(m);
            })
            .orElse(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
    }

    @PostMapping
    public ResponseEntity<?> createNote(@RequestBody Map<String, String> body, @AuthenticationPrincipal UserDetails ud) {
        Note note = new Note();
        note.setTitle(body.get("title"));
        note.setContent(body.getOrDefault("content", ""));
        note.setOwner(currentUser(ud));
        return ResponseEntity.ok(Map.of("id", noteRepo.save(note).getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateNote(@PathVariable Long id, @RequestBody Map<String, String> body, @AuthenticationPrincipal UserDetails ud) {
        User user = currentUser(ud);
        return noteRepo.findById(id)
            .filter(n -> n.getOwner().getId().equals(user.getId()) || sharedRepo.existsByNoteAndSharedUserId(n, user.getId()))
            .map(n -> {
                n.setContent(body.get("content"));
                noteRepo.save(n);
                return ResponseEntity.ok(Map.of("success", true));
            })
            .orElse(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
    }

    @GetMapping("/{id}/shared")
    public ResponseEntity<?> getSharedUsers(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        User user = currentUser(ud);
        return noteRepo.findById(id)
            .filter(n -> n.getOwner().getId().equals(user.getId()))
            .map(n -> ResponseEntity.ok(sharedRepo.findByNote(n).stream().map(s -> 
                Map.of("shareId", s.getId(), "username", s.getSharedUser().getUsername())
            ).collect(Collectors.toList())))
            .orElse(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<?> shareNote(@PathVariable Long id, @RequestBody Map<String, String> body, @AuthenticationPrincipal UserDetails ud) {
        User owner = currentUser(ud);
        return noteRepo.findById(id)
            .filter(n -> n.getOwner().getId().equals(owner.getId()))
            .map(n -> userRepo.findByUsername(body.get("username"))
                .map(target -> {
                    if (sharedRepo.existsByNoteAndSharedUserId(n, target.getId())) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Already shared."));
                    }
                    SharedNote s = new SharedNote();
                    s.setNote(n);
                    s.setSharedUser(target);
                    sharedRepo.save(s);
                    return ResponseEntity.ok(Map.of("message", "Shared."));
                })
                .orElse(ResponseEntity.badRequest().body(Map.of("message", "User not found."))))
            .orElse(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
    }

    @DeleteMapping("/{id}/share/{shareId}")
    public ResponseEntity<?> revokeShare(@PathVariable Long id, @PathVariable Long shareId, @AuthenticationPrincipal UserDetails ud) {
        User owner = currentUser(ud);
        return noteRepo.findById(id)
            .filter(n -> n.getOwner().getId().equals(owner.getId()))
            .map(n -> {
                sharedRepo.deleteById(shareId);
                return ResponseEntity.ok(Map.of("message", "Access revoked."));
            })
            .orElse(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
    }
}
