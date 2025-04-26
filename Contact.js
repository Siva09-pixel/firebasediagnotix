import React from 'react'

const Contact = () => {
  return (
    <div className="contact">
      <h2>Contact Us</h2>
      <form>
        <input type="text" placeholder="Your Name" className="input-field" />
        <input type="email" placeholder="Your Email" className="input-field" />
        <textarea placeholder="Your Message" className="input-field"></textarea>
        <button className="submit-button">Send Message</button>
      </form>
    </div>
  )
}

export default Contact