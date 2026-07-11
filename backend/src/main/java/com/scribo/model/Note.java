package com.scribo.model;

import javax.persistence.*;
import lombok.Data;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Entity
@Table(name = "notes")
public class Note {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    @UpdateTimestamp
    private LocalDateTime lastUpdated;

    @OneToMany(mappedBy = "note", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<SharedNote> sharedNotes;
}
