import { FieldValue } from 'firebase/firestore';

export interface Profile {
  userId: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  email: string;
  phone: string;
  photoURL: string;
  photoFilter?: string;
  theme: 'modern' | 'classic' | 'minimal' | 'bold';
  updatedAt?: FieldValue | string;
}

export interface Contact {
  contactId: string;
  ownerId: string;
  notes: string;
  createdAt: FieldValue | string;
}
