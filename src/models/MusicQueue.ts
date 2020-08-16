import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("musicQueue")
export class MusicQueue {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 22 })
  guild!: string;

  @Column({ type: "varchar", length: 22 })
  user!: string;

  @Column({ type: "text" })
  url!: URL;

  @Column({ type: "text" })
  title!: string;

  @Column({ type: "date", default: Date.now() })
  date: Date;
}
