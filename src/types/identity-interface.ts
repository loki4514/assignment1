export interface IContactInterface {
  id: number;
  phoneNumber?: string | null;   // update here
  email?: string | null;
  linkedId?: number | null; // the ID of another Contact linked to this one
  linkPrecedence: 'SECONDARY' | 'PRIMARY'; // "primary" if it's the first Contact in the link
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
