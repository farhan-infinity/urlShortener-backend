import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ type: 'varchar', length: 120, nullable: true })
  public name?: string;

  @Column({ type: 'varchar', length: 120, nullable: false, unique: true })
  public email: string;

  @Column({ type: 'boolean', default: false })
  public isDeleted: boolean;
  
  @Column({ type: 'varchar', length: 255 })
  public password: string;

  @CreateDateColumn({ type: 'timestamp' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  public updatedAt!: Date;
}
