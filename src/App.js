import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../firebase"; // adjust path as needed
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const questions = [
  { id: "title", label: "Book Title", type: "text" },
  { id: "author", label: "Book Author", type: "text" },
  { id: "mrp", label: "Book MRP", type: "number" },
  { id: "price", label: "Selling Price", type: "number" },
  {
    id: "condition",
    label: "Book Condition",
    type: "radio",
    options: [
      { value: "best", label: "BEST (didn't use)" },
      { value: "moderate", label: "MODERATE (everything intact)" },
      { value: "usable", label: "USABLE (minor cuts, no harm to content)" },
    ],
  },
  {
    id: "location",
    label: "Preferred Meet Location",
    type: "textarea",
    helpText: "e.g., nearby school, college, or hot spot",
  },
  { id: "contact", label: "Contact Details", type: "text" },
  {
    id: "delivery",
    label: "Delivery Method",
    type: "radio",
    options: [
      { value: "location", label: "On location given" },
      { value: "shipment", label: "By shipment (post)" },
      { value: "contact", label: "Will be shared on contact" },
    ],
  },
  {
    id: "images",
    label: "Upload Book Images",
    type: "file",
    multiple: true,
    accept: "image/*",
  },
];

const BookSaleForm = ({user}) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [imagesPreview, setImagesPreview] = useState([]);

  const current = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  const booksCollection = collection(db, "booksforsale");

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImagesPreview((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    const updated = [...imagesPreview];
    updated.splice(index, 1);
    setImagesPreview(updated);
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "unsigned_upload");
    formData.append("folder", "bookbro");

    const res = await fetch("https://api.cloudinary.com/v1_1/dca02df/image/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.secure_url;
  };

  const handleNext = async (e) => {
    e.preventDefault();

    let value;
    if (current.type === "file") {
      value = imagesPreview.map((img) => img.file);
    } else {
      const form = new FormData(e.target);
      value = form.get(current.id);
    }

    const updatedAnswers = { ...answers, [current.id]: value };
    setAnswers(updatedAnswers);

    if (step === questions.length - 1) {
      try {
        const uploadedUrls = await Promise.all(
          imagesPreview.map((img) => uploadImageToCloudinary(img.file))
        );

        const fullFormData = {
          ...updatedAnswers,
          images: uploadedUrls,
          createdAt: serverTimestamp(),
          userId: user.uid,
          userName: user.displayName || "Anonymous",
        };

        await addDoc(booksCollection, fullFormData);
        alert("Your book has been listed successfully!");
        console.log("Submitted:", fullFormData);

        setAnswers({});
        setImagesPreview([]);
        setStep(0);
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to upload. Please try again.");
      }
    } else {
      setStep((prev) => prev + 1);
    }

    e.target.reset();
    if (current.type === "file") setImagesPreview([]);
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <div className="w-full h-3 bg-gray-300">
        <motion.div
          className="h-full bg-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.form
          key={current.id}
          onSubmit={handleNext}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.4 }}
          className="flex-grow flex flex-col items-center justify-center px-4 text-center"
        >
          <div>
            <h2 className="text-2xl md:text-4xl font-bold text-indigo-600 mb-6">
              {current.label}
            </h2>
            {current.helpText && (
              <p className="text-md text-gray-500 mb-4">{current.helpText}</p>
            )}
          </div>

          <div className="w-full max-w-xl space-y-6">
            {(current.type === "text" || current.type === "number") && (
              <input
                type={current.type}
                name={current.id}
                required
                className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-indigo-400"
                placeholder="Enter here..."
              />
            )}

            {current.type === "textarea" && (
              <textarea
                name={current.id}
                required
                className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-indigo-400"
                rows="3"
                placeholder="Type your Details here..."
              />
            )}

            {current.type === "radio" && (
              <div className="space-y-3 text-left">
                {current.options.map((opt) => (
                  <label key={opt.value} className="block">
                    <input
                      type="radio"
                      name={current.id}
                      value={opt.value}
                      required
                      className="mr-2 accent-indigo-600"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            )}

            {current.type === "file" && (
              <div className="w-full">
                <input
                  type="file"
                  accept={current.accept}
                  multiple
                  onChange={handleImageChange}
                  className="w-full p-3 border rounded-lg bg-white"
                />
                <p className="text-sm text-gray-500 mt-2">
                  You can select multiple images
                </p>

                {imagesPreview.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {imagesPreview.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img.url}
                          alt={`preview-${idx}`}
                          className="w-full h-24 object-cover rounded-md border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-80 hover:opacity-100"
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-4">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((prev) => prev - 1)}
                className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
            >
              {step < questions.length - 1 ? "Next" : "Submit"}
            </button>
          </div>
        </motion.form>
      </AnimatePresence>
    </div>
  );
};

export default BookSaleForm;
