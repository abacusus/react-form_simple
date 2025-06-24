import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VantaBackground from "./VantaBackground"; 

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

const BookSaleForm = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [imagesPreview, setImagesPreview] = useState([]);

  const current = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

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

  const handleNext = (e) => {
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
      console.log("Form submitted:", updatedAnswers);
      alert("Form submitted successfully (check console).");
      setAnswers({});
      setImagesPreview([]);
      setStep(0);
    } else {
      setStep((prev) => prev + 1);
    }

    e.target.reset();
    if (current.type === "file") setImagesPreview([]);
  };

  return (
    <div className="relative h-screen overflow-hidden">
      {/* 🔹 Animated background component */}
      <div className="absolute inset-0 -z-10">
        <VantaBackground />
      </div>

      <div className="w-full h-3 bg-gray-300 z-10 relative">
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
          className="flex-grow flex flex-col items-center justify-center px-4 text-center relative z-10"
        >
          <div>
            <h2 className="text-2xl md:text-4xl font-bold text-indigo-600 mb-6">
              {current.label}
            </h2>
            {current.helpText && (
              <p className="text-md text-gray-100 mb-4 italic drop-shadow">
                {current.helpText}
              </p>
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
                placeholder="Type your details here..."
              />
            )}

            {current.type === "radio" && (
              <div className="space-y-3 text-left text-white">
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
                <p className="text-sm text-white mt-2">
                  You can select multiple images
                </p>

                {imagesPreview.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagesPreview.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img.url}
                          alt={`preview-${idx}`}
                          className="w-full h-40 object-cover rounded-md border"
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
