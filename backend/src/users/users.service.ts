import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  private toResponse(user: any) {
    const { languagePref, createdAt, ...rest } = user;
    return {
      ...rest,
      language_pref: languagePref || 'id',
      created_at: createdAt,
    };
  }

  async findAll() {
    const userList = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        divisi: users.divisi,
        jabatan: users.jabatan,
        phone: users.phone,
        languagePref: users.languagePref,
        createdAt: users.createdAt,
      })
      .from(users);
    return userList.map((u) => this.toResponse(u));
  }

  async findOne(id: string) {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        divisi: users.divisi,
        jabatan: users.jabatan,
        phone: users.phone,
        languagePref: users.languagePref,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id));
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return this.toResponse(user);
  }

  async update(id: string, data: any) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.divisi !== undefined) updateData.divisi = data.divisi;
    if (data.jabatan !== undefined) updateData.jabatan = data.jabatan;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.language_pref !== undefined)
      updateData.languagePref = data.language_pref;

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        divisi: users.divisi,
        jabatan: users.jabatan,
        phone: users.phone,
        languagePref: users.languagePref,
        createdAt: users.createdAt,
      });
    return this.toResponse(user);
  }
}
