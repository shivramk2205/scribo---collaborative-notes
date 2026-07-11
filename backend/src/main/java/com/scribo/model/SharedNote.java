package com.scribo.model;

import javax.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "shared_notes")
public class SharedNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "note_id")
    private Note note;

    @ManyToOne
    @JoinColumn(name = "shared_user_id")
    private User sharedUser;
}
