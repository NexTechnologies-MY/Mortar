import type { StoryFixture } from '../types'

/** Hand-written demo bookings `BK-9001` onward, with their histories and messages (lane W4). */
export const STORIES: StoryFixture[] = [
  {
    booking: {
      id: 'BK-9001',
      project: 'Aster Heights',
      unit: 'A-12-03',
      priceRm: 550000,
      bookingDate: '2026-09-02',
      buyer: {
        name: 'Raymond Tan Wei Hong',
        ic: '000000-00-9001',
        phone: '+60 00-000 9001',
        age: 31,
        grossMonthlyIncomeRm: 9500,
        monthlyCommitmentsRm: 600,
        propertiesOwned: 0
      },
      salesOwner: 'Nurul Aina',
      loanOwner: 'Tan Mei Ling',
      legalFirm: 'Khor & Associates'
    },
    applications: [
      {
        id: 'APP-9001-1',
        bookingId: 'BK-9001',
        bank: 'Apex Bank',
        banker: 'Kelvin Teo'
      }
    ],
    messages: [
      {
        id: 'MSG-9001-1',
        bookingId: 'BK-9001',
        senderRole: 'buyer',
        senderName: 'Raymond Tan Wei Hong',
        language: 'en',
        sentAt: '2026-09-02T16:20:00+08:00',
        body: 'Hi Nurul, transfer done for unit A-12-03 booking fee. Really looking forward to getting the unit!',
        origin: 'fixture'
      },
      {
        id: 'MSG-9001-2',
        bookingId: 'BK-9001',
        senderRole: 'sales_agent',
        senderName: 'Nurul Aina',
        language: 'en',
        sentAt: '2026-09-12T10:45:00+08:00',
        body: 'Hi Raymond, loan docs submitted to Apex Bank by Mei Ling. Just checking in, all good on your side?',
        origin: 'fixture'
      },
      {
        id: 'MSG-9001-3',
        bookingId: 'BK-9001',
        senderRole: 'buyer',
        senderName: 'Raymond Tan Wei Hong',
        language: 'en',
        sentAt: '2026-09-12T10:58:00+08:00',
        body: 'Yes all good! Very keen to sign once the loan is approved. Let me know if the bank needs anything else.',
        origin: 'fixture'
      },
      {
        id: 'MSG-9001-4',
        bookingId: 'BK-9001',
        senderRole: 'banker',
        senderName: 'Kelvin Teo',
        language: 'mixed',
        sentAt: '2026-09-16T15:30:00+08:00',
        body: 'Hi Mei Ling, Apex credit team checking Raymond Tan application. Still need latest 3 months slip gaji ah, current one only got June. Can get from buyer asap?',
        origin: 'fixture'
      }
    ],
    events: [
      {
        id: 'EV-9001-1',
        bookingId: 'BK-9001',
        applicationId: null,
        track: 'sales',
        kind: 'booked',
        occurredAt: '2026-09-02T10:15:00+08:00',
        recordedAt: '2026-09-02T10:20:00+08:00',
        reportedBy: 'Nurul Aina',
        verifiedBy: 'Nurul Aina',
        status: 'confirmed',
        source: 'story',
        messageId: null,
        document: null,
        note: 'Booking form signed and fee received'
      },
      {
        id: 'EV-9001-2',
        bookingId: 'BK-9001',
        applicationId: 'APP-9001-1',
        track: 'loan',
        kind: 'loan_submitted',
        occurredAt: '2026-09-04T14:30:00+08:00',
        recordedAt: '2026-09-04T14:35:00+08:00',
        reportedBy: 'Tan Mei Ling',
        verifiedBy: 'Tan Mei Ling',
        status: 'confirmed',
        source: 'story',
        messageId: null,
        document: null,
        note: 'Housing loan application submitted to Apex Bank'
      },
      {
        id: 'EV-9001-3',
        bookingId: 'BK-9001',
        applicationId: null,
        track: 'sales',
        kind: 'buyer_contacted',
        occurredAt: '2026-09-12T11:00:00+08:00',
        recordedAt: '2026-09-12T11:05:00+08:00',
        reportedBy: 'Nurul Aina',
        verifiedBy: 'Nurul Aina',
        status: 'confirmed',
        source: 'story',
        messageId: 'MSG-9001-3',
        document: null,
        note: 'Buyer confirmed keen to proceed once loan is approved'
      }
    ]
  },
  {
    booking: {
      id: 'BK-9002',
      project: 'Aster Heights',
      unit: 'B-08-05',
      priceRm: 620000,
      bookingDate: '2026-09-01',
      buyer: {
        name: 'Mohd Hafiz bin Razak',
        ic: '000000-00-9002',
        phone: '+60 00-000 9002',
        age: 36,
        grossMonthlyIncomeRm: 7200,
        monthlyCommitmentsRm: 1600,
        propertiesOwned: 1
      },
      salesOwner: 'Nurul Aina',
      loanOwner: 'Tan Mei Ling',
      legalFirm: 'Zainal & Co'
    },
    applications: [
      {
        id: 'APP-9002-1',
        bookingId: 'BK-9002',
        bank: 'Malayan Trust Bank',
        banker: 'Faridah Osman'
      },
      {
        id: 'APP-9002-2',
        bookingId: 'BK-9002',
        bank: 'Crestline Bank',
        banker: 'Bernard Lim'
      }
    ],
    messages: [
      {
        id: 'MSG-9002-1',
        bookingId: 'BK-9002',
        senderRole: 'buyer',
        senderName: 'Mohd Hafiz bin Razak',
        language: 'en',
        sentAt: '2026-09-01T14:10:00+08:00',
        body: 'Hi Nurul, booking form signed for B-08-05. Passing my payslips and bank statement to Mei Ling.',
        origin: 'fixture'
      },
      {
        id: 'MSG-9002-2',
        bookingId: 'BK-9002',
        senderRole: 'banker',
        senderName: 'Faridah Osman',
        language: 'en',
        sentAt: '2026-09-08T11:20:00+08:00',
        body: 'Hi Mei Ling, Malayan Trust credit committee has declined Hafiz application due to DSR exceeding threshold and insufficient net disposable income.',
        origin: 'fixture'
      },
      {
        id: 'MSG-9002-3',
        bookingId: 'BK-9002',
        senderRole: 'sales_agent',
        senderName: 'Tan Mei Ling',
        language: 'en',
        sentAt: '2026-09-09T09:40:00+08:00',
        body: 'Hafiz, Malayan Trust rejected due to DSR. We are submitting your file to Crestline Bank now with joint applicant documents.',
        origin: 'fixture'
      },
      {
        id: 'MSG-9002-4',
        bookingId: 'BK-9002',
        senderRole: 'banker',
        senderName: 'Bernard Lim',
        language: 'en',
        sentAt: '2026-09-10T16:15:00+08:00',
        body: 'Hi Mei Ling, received Hafiz second submission for Crestline Bank with wife joint name. Credit underwriting in progress.',
        origin: 'fixture'
      }
    ],
    events: [
      {
        id: 'EV-9002-1',
        bookingId: 'BK-9002',
        applicationId: null,
        track: 'sales',
        kind: 'booked',
        occurredAt: '2026-09-01T11:00:00+08:00',
        recordedAt: '2026-09-01T11:05:00+08:00',
        reportedBy: 'Nurul Aina',
        verifiedBy: 'Nurul Aina',
        status: 'confirmed',
        source: 'story',
        messageId: null,
        document: null,
        note: 'Booking confirmed'
      },
      {
        id: 'EV-9002-2',
        bookingId: 'BK-9002',
        applicationId: 'APP-9002-1',
        track: 'loan',
        kind: 'loan_submitted',
        occurredAt: '2026-09-03T10:00:00+08:00',
        recordedAt: '2026-09-03T10:05:00+08:00',
        reportedBy: 'Tan Mei Ling',
        verifiedBy: 'Tan Mei Ling',
        status: 'confirmed',
        source: 'story',
        messageId: null,
        document: null,
        note: 'Submitted to Malayan Trust Bank'
      },
      {
        id: 'EV-9002-3',
        bookingId: 'BK-9002',
        applicationId: 'APP-9002-1',
        track: 'loan',
        kind: 'loan_rejected',
        occurredAt: '2026-09-08T11:20:00+08:00',
        recordedAt: '2026-09-08T11:30:00+08:00',
        reportedBy: 'Tan Mei Ling',
        verifiedBy: 'Tan Mei Ling',
        status: 'confirmed',
        source: 'story',
        messageId: 'MSG-9002-2',
        document: null,
        note: 'First bank rejected on income DSR'
      },
      {
        id: 'EV-9002-4',
        bookingId: 'BK-9002',
        applicationId: 'APP-9002-2',
        track: 'loan',
        kind: 'loan_submitted',
        occurredAt: '2026-09-10T16:15:00+08:00',
        recordedAt: '2026-09-10T16:30:00+08:00',
        reportedBy: 'Tan Mei Ling',
        verifiedBy: 'Tan Mei Ling',
        status: 'confirmed',
        source: 'story',
        messageId: 'MSG-9002-4',
        document: null,
        note: 'Second application submitted to Crestline Bank pending review'
      }
    ]
  },
  {
    booking: {
      id: 'BK-9003',
      project: 'Aster Heights',
      unit: 'A-05-11',
      priceRm: 480000,
      bookingDate: '2026-09-04',
      buyer: {
        name: 'Siti Nurhaliza binti Osman',
        ic: '000000-00-9003',
        phone: '+60 00-000 9003',
        age: 29,
        grossMonthlyIncomeRm: 7500,
        monthlyCommitmentsRm: 500,
        propertiesOwned: 0
      },
      salesOwner: 'Nurul Aina',
      loanOwner: 'Tan Mei Ling',
      legalFirm: 'Siti & Halim Advocates'
    },
    applications: [
      {
        id: 'APP-9003-1',
        bookingId: 'BK-9003',
        bank: 'Perdana Commercial Bank',
        banker: 'Ahmad Fauzi'
      }
    ],
    messages: [
      {
        id: 'MSG-9003-1',
        bookingId: 'BK-9003',
        senderRole: 'buyer',
        senderName: 'Siti Nurhaliza binti Osman',
        language: 'ms',
        sentAt: '2026-09-04T11:00:00+08:00',
        body: 'Salam Nurul, saya dah buat bayaran tempahan unit A-05-11. Dokumen semua saya dah email kepada encik Fauzi ya.',
        origin: 'fixture'
      },
      {
        id: 'MSG-9003-2',
        bookingId: 'BK-9003',
        senderRole: 'sales_agent',
        senderName: 'Nurul Aina',
        language: 'ms',
        sentAt: '2026-09-04T11:20:00+08:00',
        body: 'Terima kasih Puan Siti. Kami akan pantau permohonan pinjaman bersama Encik Fauzi.',
        origin: 'fixture'
      },
      {
        id: 'MSG-9003-3',
        bookingId: 'BK-9003',
        senderRole: 'banker',
        senderName: 'Ahmad Fauzi',
        language: 'ms',
        sentAt: '2026-09-10T15:00:00+08:00',
        body: 'Permohonan pinjaman Puan Siti telah dihantar ke bahagian kredit Perdana Bank untuk semakan pemarkahan.',
        origin: 'fixture'
      },
      {
        id: 'MSG-9003-4',
        bookingId: 'BK-9003',
        senderRole: 'banker',
        senderName: 'Ahmad Fauzi',
        language: 'ms',
        sentAt: '2026-09-16T14:30:00+08:00',
        body: 'Salam Puan Mei Ling, laporan penilaian juruukur telah keluar untuk unit A-05-11. Nilai hartanah RM450,000 sahaja berbanding harga SPA RM480,000. Margin pinjaman 90% hanya atas RM450,000. Pembeli perlu top-up beza RM30,000 secara tunai.',
        origin: 'fixture'
      }
    ],
    events: [
      {
        id: 'EV-9003-1',
        bookingId: 'BK-9003',
        applicationId: null,
        track: 'sales',
        kind: 'booked',
        occurredAt: '2026-09-04T10:00:00+08:00',
        recordedAt: '2026-09-04T10:05:00+08:00',
        reportedBy: 'Nurul Aina',
        verifiedBy: 'Nurul Aina',
        status: 'confirmed',
        source: 'story',
        messageId: null,
        document: null,
        note: 'Booking confirmed'
      },
      {
        id: 'EV-9003-2',
        bookingId: 'BK-9003',
        applicationId: 'APP-9003-1',
        track: 'loan',
        kind: 'loan_submitted',
        occurredAt: '2026-09-10T15:00:00+08:00',
        recordedAt: '2026-09-10T15:15:00+08:00',
        reportedBy: 'Tan Mei Ling',
        verifiedBy: 'Tan Mei Ling',
        status: 'confirmed',
        source: 'story',
        messageId: 'MSG-9003-3',
        document: null,
        note: 'Submitted to Perdana Commercial Bank'
      }
    ]
  },
  {
    booking: {
      id: 'BK-9004',
      project: 'Aster Heights',
      unit: 'B-15-08',
      priceRm: 520000,
      bookingDate: '2026-09-05',
      buyer: {
        name: 'Lim Wei Keat',
        ic: '000000-00-9004',
        phone: '+60 00-000 9004',
        age: 30,
        grossMonthlyIncomeRm: 7800,
        monthlyCommitmentsRm: 400,
        propertiesOwned: 0
      },
      salesOwner: 'Nurul Aina',
      loanOwner: 'Tan Mei Ling',
      legalFirm: 'Khor & Associates'
    },
    applications: [
      {
        id: 'APP-9004-1',
        bookingId: 'BK-9004',
        bank: 'Apex Bank',
        banker: 'Kelvin Teo'
      }
    ],
    messages: [
      {
        id: 'MSG-9004-1',
        bookingId: 'BK-9004',
        senderRole: 'buyer',
        senderName: 'Lim Wei Keat',
        language: 'zh',
        sentAt: '2026-09-05T12:00:00+08:00',
        body: '你好Nurul，我已经转账了B-15-08单位的定金。附件是转账收据。',
        origin: 'fixture'
      },
      {
        id: 'MSG-9004-2',
        bookingId: 'BK-9004',
        senderRole: 'sales_agent',
        senderName: 'Nurul Aina',
        language: 'zh',
        sentAt: '2026-09-12T10:00:00+08:00',
        body: '林先生您好，房贷申请已递交给Apex Bank。一切都在顺利推进中。',
        origin: 'fixture'
      },
      {
        id: 'MSG-9004-3',
        bookingId: 'BK-9004',
        senderRole: 'buyer',
        senderName: 'Lim Wei Keat',
        language: 'zh',
        sentAt: '2026-09-17T11:20:00+08:00',
        body: 'Nurul你好，我朋友最近在看隔壁街的新楼盘，每平方尺价格便宜很多，还送全套家私。我现在有点犹豫要不要继续，在考虑要不要转过去看那个项目。',
        origin: 'fixture'
      }
    ],
    events: [
      {
        id: 'EV-9004-1',
        bookingId: 'BK-9004',
        applicationId: null,
        track: 'sales',
        kind: 'booked',
        occurredAt: '2026-09-05T11:30:00+08:00',
        recordedAt: '2026-09-05T11:35:00+08:00',
        reportedBy: 'Nurul Aina',
        verifiedBy: 'Nurul Aina',
        status: 'confirmed',
        source: 'story',
        messageId: null,
        document: null,
        note: 'Booking confirmed'
      },
      {
        id: 'EV-9004-2',
        bookingId: 'BK-9004',
        applicationId: 'APP-9004-1',
        track: 'loan',
        kind: 'loan_submitted',
        occurredAt: '2026-09-07T14:00:00+08:00',
        recordedAt: '2026-09-07T14:05:00+08:00',
        reportedBy: 'Tan Mei Ling',
        verifiedBy: 'Tan Mei Ling',
        status: 'confirmed',
        source: 'story',
        messageId: null,
        document: null,
        note: 'Submitted to Apex Bank'
      },
      {
        id: 'EV-9004-3',
        bookingId: 'BK-9004',
        applicationId: null,
        track: 'sales',
        kind: 'buyer_contacted',
        occurredAt: '2026-09-12T10:00:00+08:00',
        recordedAt: '2026-09-12T10:15:00+08:00',
        reportedBy: 'Nurul Aina',
        verifiedBy: 'Nurul Aina',
        status: 'confirmed',
        source: 'story',
        messageId: 'MSG-9004-2',
        document: null,
        note: 'Followed up with buyer on loan submission status'
      }
    ]
  },
  {
    booking: {
      id: 'BK-9005',
      project: 'Aster Heights',
      unit: 'A-18-07',
      priceRm: 450000,
      bookingDate: '2026-09-03',
      buyer: {
        name: 'Kavitha a/p Rajendran',
        ic: '000000-00-9005',
        phone: '+60 00-000 9005',
        age: 33,
        grossMonthlyIncomeRm: 7000,
        monthlyCommitmentsRm: 450,
        propertiesOwned: 0
      },
      salesOwner: 'Nurul Aina',
      loanOwner: 'Tan Mei Ling',
      legalFirm: 'Ramesh & Nathan'
    },
    applications: [
      {
        id: 'APP-9005-1',
        bookingId: 'BK-9005',
        bank: 'Nusantara Bank',
        banker: 'Wendy Choo'
      }
    ],
    messages: [
      {
        id: 'MSG-9005-1',
        bookingId: 'BK-9005',
        senderRole: 'buyer',
        senderName: 'Kavitha a/p Rajendran',
        language: 'mixed',
        sentAt: '2026-09-03T15:00:00+08:00',
        body: 'Hi Nurul, booking fee transferred for unit A-18-07 ya. Loan form also passed to Wendy.',
        origin: 'fixture'
      },
      {
        id: 'MSG-9005-2',
        bookingId: 'BK-9005',
        senderRole: 'banker',
        senderName: 'Wendy Choo',
        language: 'mixed',
        sentAt: '2026-09-10T11:00:00+08:00',
        body: 'Hi Mei Ling, Kavitha loan submission received. Checking documents now.',
        origin: 'fixture'
      },
      {
        id: 'MSG-9005-3',
        bookingId: 'BK-9005',
        senderRole: 'buyer',
        senderName: 'Kavitha a/p Rajendran',
        language: 'mixed',
        sentAt: '2026-09-17T16:45:00+08:00',
        body: 'Hi Nurul, really sorry ah. Just received sudden offer letter to transfer to Penang office next month. Cannot proceed with this unit already. How to cancel booking and get refund of my deposit ah?',
        origin: 'fixture'
      }
    ],
    events: [
      {
        id: 'EV-9005-1',
        bookingId: 'BK-9005',
        applicationId: null,
        track: 'sales',
        kind: 'booked',
        occurredAt: '2026-09-03T14:30:00+08:00',
        recordedAt: '2026-09-03T14:35:00+08:00',
        reportedBy: 'Nurul Aina',
        verifiedBy: 'Nurul Aina',
        status: 'confirmed',
        source: 'story',
        messageId: null,
        document: null,
        note: 'Booking confirmed'
      },
      {
        id: 'EV-9005-2',
        bookingId: 'BK-9005',
        applicationId: 'APP-9005-1',
        track: 'loan',
        kind: 'loan_submitted',
        occurredAt: '2026-09-10T11:00:00+08:00',
        recordedAt: '2026-09-10T11:15:00+08:00',
        reportedBy: 'Tan Mei Ling',
        verifiedBy: 'Tan Mei Ling',
        status: 'confirmed',
        source: 'story',
        messageId: 'MSG-9005-2',
        document: null,
        note: 'Loan documents received by Nusantara Bank'
      }
    ]
  },
  {
    booking: {
      id: 'BK-9006',
      project: 'Aster Heights',
      unit: 'A-23A-02',
      priceRm: 580000,
      bookingDate: '2026-08-28',
      buyer: {
        name: 'Chen Jia Hao',
        ic: '000000-00-9006',
        phone: '+60 00-000 9006',
        age: 34,
        grossMonthlyIncomeRm: 9800,
        monthlyCommitmentsRm: 700,
        propertiesOwned: 1
      },
      salesOwner: 'Nurul Aina',
      loanOwner: 'Tan Mei Ling',
      legalFirm: 'Cheong & Partners'
    },
    applications: [
      {
        id: 'APP-9006-1',
        bookingId: 'BK-9006',
        bank: 'Malayan Trust Bank',
        banker: 'Faridah Osman'
      }
    ],
    messages: [
      {
        id: 'MSG-9006-1',
        bookingId: 'BK-9006',
        senderRole: 'buyer',
        senderName: 'Chen Jia Hao',
        language: 'en',
        sentAt: '2026-08-28T14:00:00+08:00',
        body: 'Hi Nurul, booking fee transferred for unit A-23A-02. Looking forward to the loan review.',
        origin: 'fixture'
      },
      {
        id: 'MSG-9006-2',
        bookingId: 'BK-9006',
        senderRole: 'banker',
        senderName: 'Faridah Osman',
        language: 'en',
        sentAt: '2026-09-10T14:30:00+08:00',
        body: 'Dear Mei Ling, pleased to inform that Chen Jia Hao housing loan of RM522,000 has been approved. Letter of Offer signed and accepted by buyer.',
        origin: 'fixture'
      },
      {
        id: 'MSG-9006-3',
        bookingId: 'BK-9006',
        senderRole: 'solicitor',
        senderName: 'Samantha Cheong',
        language: 'en',
        sentAt: '2026-09-17T15:10:00+08:00',
        body: 'Dear Nurul, we have received the accepted Letter of Offer from Malayan Trust Bank. We have scheduled the SPA execution appointment with Mr. Chen Jia Hao for Friday, 25 September 2026 at 2:30 PM at our Petaling Jaya office.',
        origin: 'fixture'
      }
    ],
    events: [
      {
        id: 'EV-9006-1',
        bookingId: 'BK-9006',
        applicationId: null,
        track: 'sales',
        kind: 'booked',
        occurredAt: '2026-08-28T11:00:00+08:00',
        recordedAt: '2026-08-28T11:05:00+08:00',
        reportedBy: 'Nurul Aina',
        verifiedBy: 'Nurul Aina',
        status: 'confirmed',
        source: 'story',
        messageId: null,
        document: null,
        note: 'Booking confirmed'
      },
      {
        id: 'EV-9006-2',
        bookingId: 'BK-9006',
        applicationId: 'APP-9006-1',
        track: 'loan',
        kind: 'loan_submitted',
        occurredAt: '2026-08-30T10:00:00+08:00',
        recordedAt: '2026-08-30T10:05:00+08:00',
        reportedBy: 'Tan Mei Ling',
        verifiedBy: 'Tan Mei Ling',
        status: 'confirmed',
        source: 'story',
        messageId: null,
        document: null,
        note: 'Application submitted to Malayan Trust Bank'
      },
      {
        id: 'EV-9006-3',
        bookingId: 'BK-9006',
        applicationId: 'APP-9006-1',
        track: 'loan',
        kind: 'loan_approved',
        occurredAt: '2026-09-10T14:30:00+08:00',
        recordedAt: '2026-09-10T14:45:00+08:00',
        reportedBy: 'Tan Mei Ling',
        verifiedBy: 'Tan Mei Ling',
        status: 'confirmed',
        source: 'story',
        messageId: 'MSG-9006-2',
        document: null,
        note: 'Letter of Offer issued and accepted'
      }
    ]
  },
  {
    booking: {
      id: 'BK-9007',
      project: 'Aster Heights',
      unit: 'B-21-03A',
      priceRm: 500000,
      bookingDate: '2026-09-01',
      buyer: {
        name: 'Dinesh Kumar a/l Selvam',
        ic: '000000-00-9007',
        phone: '+60 00-000 9007',
        age: 32,
        grossMonthlyIncomeRm: 7500,
        monthlyCommitmentsRm: 350,
        propertiesOwned: 0
      },
      salesOwner: 'Nurul Aina',
      loanOwner: 'Tan Mei Ling',
      legalFirm: 'Ramesh & Nathan'
    },
    applications: [
      {
        id: 'APP-9007-1',
        bookingId: 'BK-9007',
        bank: 'Perdana Commercial Bank',
        banker: 'Hafizul Zain'
      }
    ],
    messages: [
      {
        id: 'MSG-9007-1',
        bookingId: 'BK-9007',
        senderRole: 'buyer',
        senderName: 'Dinesh Kumar a/l Selvam',
        language: 'en',
        sentAt: '2026-09-01T15:30:00+08:00',
        body: 'Hi Nurul, transfer done for unit B-21-03A booking. Documents handed to Hafizul from Perdana Bank.',
        origin: 'fixture'
      },
      {
        id: 'MSG-9007-2',
        bookingId: 'BK-9007',
        senderRole: 'banker',
        senderName: 'Hafizul Zain',
        language: 'mixed',
        sentAt: '2026-09-06T10:15:00+08:00',
        body: 'Hi Mei Ling, application submitted into system. Will process and update outcome by next week ya.',
        origin: 'fixture'
      },
      {
        id: 'MSG-9007-3',
        bookingId: 'BK-9007',
        senderRole: 'sales_agent',
        senderName: 'Nurul Aina',
        language: 'mixed',
        sentAt: '2026-09-18T09:15:00+08:00',
        body: 'Hi Hafizul, any progress on Dinesh loan for unit B-21-03A? Already 12 days since submission no news bro, client keep calling chasing update.',
        origin: 'fixture'
      }
    ],
    events: [
      {
        id: 'EV-9007-1',
        bookingId: 'BK-9007',
        applicationId: null,
        track: 'sales',
        kind: 'booked',
        occurredAt: '2026-09-01T14:00:00+08:00',
        recordedAt: '2026-09-01T14:05:00+08:00',
        reportedBy: 'Nurul Aina',
        verifiedBy: 'Nurul Aina',
        status: 'confirmed',
        source: 'story',
        messageId: null,
        document: null,
        note: 'Booking fee received'
      },
      {
        id: 'EV-9007-2',
        bookingId: 'BK-9007',
        applicationId: 'APP-9007-1',
        track: 'loan',
        kind: 'loan_submitted',
        occurredAt: '2026-09-06T10:15:00+08:00',
        recordedAt: '2026-09-06T10:30:00+08:00',
        reportedBy: 'Tan Mei Ling',
        verifiedBy: 'Tan Mei Ling',
        status: 'confirmed',
        source: 'story',
        messageId: 'MSG-9007-2',
        document: null,
        note: 'Submitted to Perdana Commercial Bank'
      }
    ]
  },
  {
    booking: {
      id: 'BK-9008',
      project: 'Aster Heights',
      unit: 'A-28-01',
      priceRm: 850000,
      bookingDate: '2026-09-10',
      buyer: {
        name: 'Datuk Azman bin Kamaruddin',
        ic: '000000-00-9008',
        phone: '+60 00-000 9008',
        age: 45,
        grossMonthlyIncomeRm: 13000,
        monthlyCommitmentsRm: 3500,
        propertiesOwned: 2
      },
      salesOwner: 'Nurul Aina',
      loanOwner: 'Tan Mei Ling',
      legalFirm: 'Zainal & Co'
    },
    applications: [
      {
        id: 'APP-9008-1',
        bookingId: 'BK-9008',
        bank: 'Malayan Trust Bank',
        banker: 'Faridah Osman'
      }
    ],
    messages: [
      {
        id: 'MSG-9008-1',
        bookingId: 'BK-9008',
        senderRole: 'buyer',
        senderName: 'Datuk Azman bin Kamaruddin',
        language: 'ms',
        sentAt: '2026-09-10T11:00:00+08:00',
        body: 'Salam Nurul, saya dah tandatangan borang tempahan unit A-28-01. Ini hartanah ketiga saya, jadi bank kata margin cuma dapat 70%.',
        origin: 'fixture'
      },
      {
        id: 'MSG-9008-2',
        bookingId: 'BK-9008',
        senderRole: 'sales_agent',
        senderName: 'Tan Mei Ling',
        language: 'ms',
        sentAt: '2026-09-12T14:30:00+08:00',
        body: 'Salam Datuk, permohonan pinjaman telah dihantar kepada Malayan Trust Bank untuk semakan margin 70%.',
        origin: 'fixture'
      },
      {
        id: 'MSG-9008-3',
        bookingId: 'BK-9008',
        senderRole: 'buyer',
        senderName: 'Datuk Azman bin Kamaruddin',
        language: 'ms',
        sentAt: '2026-09-17T10:15:00+08:00',
        body: 'Nurul, boleh tolong semak balik berapa anggaran ansuran bulanan kalau margin 70% untuk 25 tahun? Komitmen sedia ada saya agak tinggi sekarang, risau DSR sangkut.',
        origin: 'fixture'
      }
    ],
    events: [
      {
        id: 'EV-9008-1',
        bookingId: 'BK-9008',
        applicationId: null,
        track: 'sales',
        kind: 'booked',
        occurredAt: '2026-09-10T10:30:00+08:00',
        recordedAt: '2026-09-10T10:35:00+08:00',
        reportedBy: 'Nurul Aina',
        verifiedBy: 'Nurul Aina',
        status: 'confirmed',
        source: 'story',
        messageId: null,
        document: null,
        note: 'Booking confirmed'
      },
      {
        id: 'EV-9008-2',
        bookingId: 'BK-9008',
        applicationId: 'APP-9008-1',
        track: 'loan',
        kind: 'loan_submitted',
        occurredAt: '2026-09-12T14:30:00+08:00',
        recordedAt: '2026-09-12T14:40:00+08:00',
        reportedBy: 'Tan Mei Ling',
        verifiedBy: 'Tan Mei Ling',
        status: 'confirmed',
        source: 'story',
        messageId: 'MSG-9008-2',
        document: null,
        note: 'Submitted to Malayan Trust Bank under 70% MOF cap'
      }
    ]
  }
]
