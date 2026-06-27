import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import type { BookingFormData, EventType } from '@/types';

const schema = z.object({
  slot_id:        z.number().positive(),
  full_name:      z.string().min(2, 'الاسم مطلوب ولا يقل عن حرفين').max(150),
  phone_number:   z.string().regex(/^\+?[0-9\s\-()]{7,20}$/, 'رقم الجوال غير صحيح'),
  email:          z.string().email('البريد الإلكتروني غير صحيح').or(z.literal('')).optional(),
  event_type:     z.enum(['wedding', 'graduation', 'commercial', 'portrait'], {
                    errorMap: () => ({ message: 'يرجى اختيار نوع المناسبة' }),
                  }),
  location:       z.string().min(2, 'الموقع مطلوب').max(255),
  notes:          z.string().max(2000).optional().default(''),
  terms_accepted: z.literal(true, { errorMap: () => ({ message: 'يجب الموافقة على الشروط والأحكام' }) }),
});

export type BookingSchema = z.infer<typeof schema>;

export function useBookingForm(slotId: number) {
  const { handleSubmit, errors, defineField, meta, resetForm } = useForm<BookingSchema>({
    validationSchema: toTypedSchema(schema),
    initialValues: {
      slot_id:        slotId,
      full_name:      '',
      phone_number:   '',
      email:          '',
      event_type:     undefined as unknown as EventType,
      location:       '',
      notes:          '',
      terms_accepted: undefined as unknown as true,
    },
  });

  const [fullName,      fullNameAttrs]      = defineField('full_name');
  const [phoneNumber,   phoneNumberAttrs]   = defineField('phone_number');
  const [email,         emailAttrs]         = defineField('email');
  const [eventType,     eventTypeAttrs]     = defineField('event_type');
  const [location,      locationAttrs]      = defineField('location');
  const [notes,         notesAttrs]         = defineField('notes');
  const [termsAccepted, termsAcceptedAttrs] = defineField('terms_accepted');

  return {
    handleSubmit,
    errors,
    meta,
    resetForm,
    fields: {
      fullName,      fullNameAttrs,
      phoneNumber,   phoneNumberAttrs,
      email,         emailAttrs,
      eventType,     eventTypeAttrs,
      location,      locationAttrs,
      notes,         notesAttrs,
      termsAccepted, termsAcceptedAttrs,
    },
  };
}
