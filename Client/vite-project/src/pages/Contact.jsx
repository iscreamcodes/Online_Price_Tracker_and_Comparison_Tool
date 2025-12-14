export default function Contact() {
    return (
      <div className="bg-white min-h-screen px-6 md:px-20 py-12 font-poppins">
        <h1 className="text-3xl font-bold text-[#004d40] mb-4">Contact Us</h1>
        <p className="text-gray-700 mb-8">
          We'd love to hear from you. Whether you have a question, feedback, or a feature suggestion —
          feel free to reach out.
        </p>
  
        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact Info */}
          <div>
            <h2 className="text-xl font-semibold text-[#004d40] mb-2">Get in Touch</h2>
            <p className="text-gray-700 mb-4">
              You can reach us using the details below:
            </p>
  
            <div className="space-y-3 text-gray-700">
              <p><strong>Email:</strong> support@trackit.com</p>
              <p><strong>Phone:</strong> +254 712 345 678</p>
              <p><strong>Address:</strong> Nairobi, Kenya</p>
            </div>
  
            <p className="mt-6 text-gray-600 italic">
              We aim to reply within 24 hours.
            </p>
          </div>
  
          {/* Contact Form */}
          <form className="bg-white shadow-md p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-semibold text-[#004d40] mb-4">Send a Message</h2>
  
            <input
              type="text"
              placeholder="Your Name"
              className="w-full p-3 border rounded-lg mb-4"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full p-3 border rounded-lg mb-4"
            />
            <textarea
              placeholder="Write your message..."
              rows={5}
              className="w-full p-3 border rounded-lg mb-4"
            ></textarea>
  
            <button
              type="submit"
              className="w-full bg-[#004d40] text-white py-3 rounded-lg font-medium hover:bg-green-800 transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    );
  }
  