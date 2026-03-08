import { Database } from "@/integrations/supabase/types";

type Booking = Database["public"]["Tables"]["bookings"]["Row"];

export function generateBookingPdf(booking: Booking) {
  const subtotal = Math.round(booking.total_amount / 1.18);
  const gst = booking.total_amount - subtotal;
  const pricePerNight = Math.round(subtotal / booking.total_nights);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${booking.booking_id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 3px solid #2d5016; padding-bottom: 20px; }
    .logo { font-size: 24px; font-weight: 700; color: #2d5016; }
    .logo span { display: block; font-size: 12px; font-weight: 400; color: #666; }
    .invoice-title { text-align: right; }
    .invoice-title h2 { font-size: 28px; color: #2d5016; }
    .invoice-title p { font-size: 13px; color: #666; margin-top: 4px; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 8px; font-weight: 600; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .field label { font-size: 12px; color: #888; }
    .field p { font-size: 14px; font-weight: 500; margin-top: 2px; }
    .status { display: inline-block; padding: 3px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
    .status-confirmed { background: #dcfce7; color: #166534; }
    .status-completed { background: #e0e7ff; color: #3730a3; }
    .status-pending { background: #fef9c3; color: #854d0e; }
    .status-cancelled { background: #fecaca; color: #991b1b; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; padding: 10px 12px; border-bottom: 2px solid #e5e5e5; }
    td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #f0f0f0; }
    td.right, th.right { text-align: right; }
    .totals { margin-top: 16px; border-top: 2px solid #e5e5e5; padding-top: 12px; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 12px; font-size: 14px; }
    .total-row.grand { font-size: 18px; font-weight: 700; color: #2d5016; border-top: 2px solid #2d5016; padding-top: 12px; margin-top: 8px; }
    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #e5e5e5; padding-top: 16px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      Gopika Cottage
      <span>Beach Cottage & Homestay</span>
    </div>
    <div class="invoice-title">
      <h2>INVOICE</h2>
      <p>${booking.booking_id}</p>
      <p>${new Date(booking.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Guest Information</div>
    <div class="grid">
      <div class="field"><label>Name</label><p>${booking.full_name}</p></div>
      <div class="field"><label>Mobile</label><p>${booking.mobile_number}</p></div>
      <div class="field"><label>Email</label><p>${booking.email}</p></div>
      <div class="field"><label>Status</label><p><span class="status status-${booking.status}">${booking.status}</span></p></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Booking Details</div>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Nights</th>
          <th>Guests</th>
          <th class="right">Rate/Night</th>
          <th class="right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${booking.room_type === 'ac' ? 'AC Room' : 'Non-AC Room'}<br><span style="font-size:12px;color:#888">${new Date(booking.check_in_date).toLocaleDateString('en-IN')} → ${new Date(booking.check_out_date).toLocaleDateString('en-IN')}</span></td>
          <td>${booking.total_nights}</td>
          <td>${booking.adults}A + ${booking.children}C</td>
          <td class="right">₹${pricePerNight.toLocaleString('en-IN')}</td>
          <td class="right">₹${subtotal.toLocaleString('en-IN')}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="totals">
    <div class="total-row"><span>Subtotal</span><span>₹${subtotal.toLocaleString('en-IN')}</span></div>
    <div class="total-row"><span>GST (18%)</span><span>₹${gst.toLocaleString('en-IN')}</span></div>
    <div class="total-row grand"><span>Total Amount</span><span>₹${booking.total_amount.toLocaleString('en-IN')}</span></div>
  </div>

  <div class="footer">
    <p>Thank you for choosing Gopika Cottage!</p>
    <p style="margin-top:4px;">This is a computer-generated invoice and does not require a signature.</p>
  </div>

  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win) {
    win.onafterprint = () => {
      URL.revokeObjectURL(url);
    };
  }
}
