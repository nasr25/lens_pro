export type Locale = 'ar' | 'en';

export const messages: Record<Locale, Record<string, string>> = {
  ar: {
    // Header
    nav_home: 'الرئيسية',
    nav_book: 'احجز الآن',
    nav_about: 'من نحن',
    nav_work: 'أعمالنا',
    nav_packages: 'الباقات',
    nav_contact: 'تواصل معنا',
    lang_toggle: 'EN',

    // Hero
    hero_title: 'احجز جلستك التصويرية',
    hero_subtitle: 'نلتقط لحظاتك الثمينة بعدسة احترافية تخلّد ذكرياتك للأبد',
    hero_cta: 'احجز الآن',

    // Calendar
    calendar_title: 'اختر موعدك',
    calendar_available: 'متاح',
    calendar_pending: 'قيد المراجعة',
    calendar_confirmed: 'محجوز',
    calendar_blocked: 'غير متاح',

    // Booking form
    form_title: 'تفاصيل الحجز',
    form_name: 'الاسم الكامل',
    form_phone: 'رقم الجوال',
    form_email: 'البريد الإلكتروني',
    form_event: 'نوع المناسبة',
    form_location: 'الموقع',
    form_notes: 'ملاحظات إضافية',
    form_terms: 'أوافق على الشروط والأحكام',
    form_submit: 'تأكيد الحجز',

    // About section
    about_title: 'من نحن',

    // Our work section
    work_title: 'أعمالنا',
    work_subtitle: 'لمحة من أجمل اللحظات التي وثّقناها',

    // Packages section
    packages_title: 'باقاتنا',
    packages_subtitle: 'اختر الباقة التي تناسب احتياجاتك',
    packages_book: 'احجز الآن',
    packages_featured: 'الأكثر طلباً',
    packages_currency: 'ريال',

    // Footer
    footer_rights: 'جميع الحقوق محفوظة',
    footer_follow: 'تابعنا',

    // Confirmation
    confirm_title: 'تم الحجز بنجاح!',
    confirm_message: 'شكراً لك، تم استلام طلب الحجز وسيتم مراجعته والتواصل معك قريباً.',
    confirm_id: 'رقم الحجز',
    confirm_back: 'العودة للرئيسية',

    // Errors
    error_required: 'هذا الحقل مطلوب',
    error_phone: 'رقم الجوال غير صحيح',
    error_email: 'البريد الإلكتروني غير صحيح',
  },
  en: {
    // Header
    nav_home: 'Home',
    nav_book: 'Book Now',
    nav_about: 'About',
    nav_work: 'Our Work',
    nav_packages: 'Packages',
    nav_contact: 'Contact',
    lang_toggle: 'ع',

    // Hero
    hero_title: 'Book Your Photography Session',
    hero_subtitle: 'We capture your precious moments with a professional lens that immortalizes your memories forever',
    hero_cta: 'Book Now',

    // Calendar
    calendar_title: 'Choose Your Date',
    calendar_available: 'Available',
    calendar_pending: 'Pending',
    calendar_confirmed: 'Booked',
    calendar_blocked: 'Unavailable',

    // Booking form
    form_title: 'Booking Details',
    form_name: 'Full Name',
    form_phone: 'Phone Number',
    form_email: 'Email Address',
    form_event: 'Event Type',
    form_location: 'Location',
    form_notes: 'Additional Notes',
    form_terms: 'I agree to the Terms & Conditions',
    form_submit: 'Confirm Booking',

    // About section
    about_title: 'About Us',

    // Our work section
    work_title: 'Our Work',
    work_subtitle: 'A glimpse of the most beautiful moments we have documented',

    // Packages section
    packages_title: 'Our Packages',
    packages_subtitle: 'Choose the package that suits your needs',
    packages_book: 'Book Now',
    packages_featured: 'Most Popular',
    packages_currency: 'SAR',

    // Footer
    footer_rights: 'All rights reserved',
    footer_follow: 'Follow us',

    // Confirmation
    confirm_title: 'Booking Successful!',
    confirm_message: 'Thank you, your booking request has been received and we will contact you shortly.',
    confirm_id: 'Booking ID',
    confirm_back: 'Back to Home',

    // Errors
    error_required: 'This field is required',
    error_phone: 'Invalid phone number',
    error_email: 'Invalid email address',
  },
};
