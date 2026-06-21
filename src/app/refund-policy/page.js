export const metadata = {
  title: 'Refunds & Cancellations Policy | RoadsRide',
  description: 'Refunds and Cancellations Policy for RoadsRide.',
};

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      <h1 className="mb-8 text-3xl font-bold text-brand-black md:text-5xl">Refunds & Cancellations Policy</h1>
      <div className="prose prose-lg text-gray-600 max-w-none">
        <p className="mb-8">
          Our refund and returns policy lasts 7 days. If 7 days have passed since your purchase, we can’t offer you a full refund or exchange.
        </p>

        <p>
          To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging.
        </p>

        <p>
          Several types of goods are exempt from being returned. Perishable goods such as food, flowers, newspapers or magazines cannot be returned. We also do not accept products that are intimate or sanitary goods, hazardous materials, or flammable liquids or gases.
        </p>

        <p className="font-semibold text-brand-black mt-6">Additional non-returnable items:</p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Gift cards</li>
          <li>Downloadable software products</li>
          <li>Some health and personal care items</li>
        </ul>

        <p>To complete your return, we require a receipt or proof of purchase.</p>
        <p className="font-semibold text-brand-black">Please do not send your purchase back to the manufacturer.</p>

        <p className="font-semibold text-brand-black mt-6">There are certain situations where only partial refunds are granted:</p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Book with obvious signs of use</li>
          <li>CD, DVD, VHS tape, software, video game, cassette tape, or vinyl record that has been opened.</li>
          <li>Any item not in its original condition, is damaged or missing parts for reasons not due to our error.</li>
          <li>Any item that is returned more than 7 days after delivery</li>
        </ul>

        <h2 className="mt-10 mb-4 text-2xl font-bold text-brand-black">Refunds</h2>
        <p>
          Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.
        </p>
        <p>
          If you are approved, then your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment, within a certain amount of days.
        </p>

        <h2 className="mt-10 mb-4 text-2xl font-bold text-brand-black">Late or missing refunds</h2>
        <p>If you haven’t received a refund yet, first check your bank account again.</p>
        <p>Then contact your credit card company, it may take some time before your refund is officially posted.</p>
        <p>Next contact your bank. There is often some processing time before a refund is posted.</p>
        <p>
          If you’ve done all of this and you still have not received your refund yet, please contact us at <strong>  info.roadsride@gmail.com</strong>.
        </p>

        <h2 className="mt-10 mb-4 text-2xl font-bold text-brand-black">Sale items</h2>
        <p>Only regular priced items may be refunded. Sale items cannot be refunded.</p>

        <h2 className="mt-10 mb-4 text-2xl font-bold text-brand-black">Exchanges</h2>
        <p>
          We only replace items if they are defective or damaged. If you need to exchange it for the same item, send us an email at <strong>  info.roadsride@gmail.com</strong> and send your item to: <strong>Pahalwan Dairy, Jogabai Extention, Jamia Nagar, Delhi 110025</strong>.
        </p>

        <h2 className="mt-10 mb-4 text-2xl font-bold text-brand-black">Gifts</h2>
        <p>
          If the item was marked as a gift when purchased and shipped directly to you, you’ll receive a gift credit for the value of your return. Once the returned item is received, a gift certificate will be mailed to you.
        </p>
        <p>
          If the item wasn’t marked as a gift when purchased, or the gift giver had the order shipped to themselves to give to you later, we will send a refund to the gift giver and they will find out about your return.
        </p>

        <h2 className="mt-10 mb-4 text-2xl font-bold text-brand-black">Shipping returns</h2>
        <p>
          To return your product, you should mail your product to: <strong>Pahalwan Dairy, Jogabai Extention, Jamia Nagar, Delhi 110025</strong>.
        </p>
        <p>
          You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.
        </p>
        <p>Depending on where you live, the time it may take for your exchanged product to reach you may vary.</p>
        <p>
          If you are returning more expensive items, you may consider using a trackable shipping service or purchasing shipping insurance. We don’t guarantee that we will receive your returned item.
        </p>

        <h2 className="mt-10 mb-4 text-2xl font-bold text-brand-black">Need help?</h2>
        <p>For any questions, support, or concerns, feel free to contact us:</p>
        
        <div className="mt-4 p-6 bg-gray-50 rounded-lg">
          <p className="flex items-center gap-2 mb-2">
            <span className="font-semibold">📞 Mobile:</span> <a href="tel:+919097968671" className="text-brand-black hover:underline">+91 90979 68671</a>
          </p>
          <p className="flex items-center gap-2">
            <span className="font-semibold">📧 Email:</span> <a href="mailto:info.  info.roadsride@gmail.com" className="text-brand-black hover:underline">info.  info.roadsride@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
