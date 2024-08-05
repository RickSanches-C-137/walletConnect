import { Schema, model } from "mongoose";

export interface INorsemen {
  name: string;
  email: string;
  dobday: string;
  dobmonth: string;
  dobyear: string;
  maritalstatus: string;
  phone: string;
  whatsappphone: string
}

const NorsemenSchema = new Schema<INorsemen>({
  name: { type: String, required: true },
  email: { type: String },
  dobday: { type: String, required: true },
  dobmonth: { type: String, required: true },
  dobyear: { type: String },
  maritalstatus: { type: String },
  phone: { type: String },
  whatsappphone: { type: String }
});

const Norsemen = model<INorsemen>("Norsemen", NorsemenSchema);
export default Norsemen;
