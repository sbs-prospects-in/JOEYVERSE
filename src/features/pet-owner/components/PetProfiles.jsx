import React, { useState, useRef } from "react";
import {
  PawPrint,
  Plus,
  ChevronRight,
  X,
  Trash2,
  Edit3,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import Cropper from "react-easy-crop";
import { supabase } from "../../auth/api/supabase";
import { useAuthStore } from "../../auth/store/authStore";

const shortId = (shortIdNum, prefix) =>
  `${prefix}-${String(shortIdNum || 0).padStart(2, "0")}`;

const formatAge = (age, unit) => {
  if (age === null || age === undefined || age === "") return "Unknown Age";
  const numAge = parseInt(age, 10);
  if (isNaN(numAge)) return "Unknown Age";
  
  const isMonths = unit?.toLowerCase() === "months" || unit?.toLowerCase() === "month";
  
  if (isMonths) {
    if (numAge >= 12) {
      const years = Math.floor(numAge / 12);
      const months = numAge % 12;
      if (months === 0) return `${years} ${years === 1 ? "Year" : "Years"}`;
      return `${years} ${years === 1 ? "Year" : "Years"} ${months} ${months === 1 ? "Month" : "Months"}`;
    }
    return `${numAge} ${numAge === 1 ? "Month" : "Months"}`;
  }
  
  return `${numAge} ${numAge === 1 ? "Year" : "Years"}`;
};

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => {
    image.onload = resolve;
  });
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );
  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve(file);
    }, "image/jpeg");
  });
};

export default function PetProfiles({
  myPets,
  fetchPets,
  isAddPetOpen,
  setIsAddPetOpen,
}) {
  const { user } = useAuthStore();

  const [selectedPet, setSelectedPet] = useState(null);
  const [isEditingPet, setIsEditingPet] = useState(false);
  const [editPetData, setEditPetData] = useState({});
  const [isSubmittingPet, setIsSubmittingPet] = useState(false);

  const [newPet, setNewPet] = useState({
    name: "",
    species: "Dog",
    breed: "",
    age: "",
    ageUnit: "Years",
  });

  const [petImageFile, setPetImageFile] = useState(null);
  const [petImagePreview, setPetImagePreview] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPetImagePreview(reader.result);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async (e) => {
    e.preventDefault();
    try {
      const croppedImage = await getCroppedImg(
        petImagePreview,
        croppedAreaPixels,
      );
      setPetImageFile(croppedImage);
      const url = URL.createObjectURL(croppedImage);
      setPetImagePreview(url);
      setIsCropping(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to crop image");
    }
  };

  const handleAddPet = async (e) => {
    e.preventDefault();
    if (!user?.id || isSubmittingPet) return;

    setIsSubmittingPet(true);
    const toastId = toast.loading("Adding companion...");

    try {
      const { data: insertedPets, error } = await supabase
        .from("pets")
        .insert({
          owner_id: user.id,
          name: newPet.name,
          species: newPet.species,
          breed: newPet.breed,
          age: newPet.age ? parseInt(newPet.age) : null,
          age_unit: newPet.ageUnit || "Years",
        })
        .select("id");

      toast.dismiss(toastId);

      if (!error) {
        const insertedPet =
          insertedPets && insertedPets.length > 0 ? insertedPets[0] : null;

        if (petImageFile && insertedPet) {
          try {
            const uploadPromise = supabase.storage
              .from("pet-images")
              .upload(`pet_profile_${insertedPet.id}`, petImageFile, {
                upsert: true,
              });

            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error("Image upload timed out")),
                10000,
              ),
            );

            const uploadResult = await Promise.race([
              uploadPromise,
              timeoutPromise,
            ]);

            if (!uploadResult?.error) {
              const { data: urlData } = supabase.storage
                .from("pet-images")
                .getPublicUrl(`pet_profile_${insertedPet.id}`);
              if (urlData?.publicUrl) {
                await supabase
                  .from("pets")
                  .update({ avatar_url: urlData.publicUrl })
                  .eq("id", insertedPet.id);
              }
            } else {
              console.error("Supabase upload error:", uploadResult.error);
              toast.error("Companion saved, but image upload failed.");
            }
          } catch (uploadError) {
            console.error("Failed to upload image", uploadError);
            toast.error("Companion saved, but image upload failed.");
          }
        }

        setIsAddPetOpen(false);
        setNewPet({
          name: "",
          species: "Dog",
          breed: "",
          age: "",
          ageUnit: "Years",
        });
        setPetImageFile(null);
        setPetImagePreview(null);
        if (fetchPets) fetchPets();
        toast.success("Companion added!");
      } else {
        console.error("Error inserting pet:", error);
        toast.error(error?.message || "Error adding pet");
      }
    } catch (err) {
      toast.dismiss(toastId);
      console.error("Unexpected error in handleAddPet:", err);
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmittingPet(false);
    }
  };

  const handleDeletePet = async (petId) => {
    if (!window.confirm("Are you sure you want to remove this companion?"))
      return;
    const { error } = await supabase.from("pets").delete().eq("id", petId);
    if (!error) {
      toast.success("Pet removed successfully");
      setSelectedPet(null);
      if (fetchPets) fetchPets();
    } else {
      toast.error("Failed to remove pet");
    }
  };

  const handleSavePet = async () => {
    if (!selectedPet?.id || !editPetData.name?.trim()) {
      toast.error("Pet name is required");
      return;
    }
    const { error } = await supabase
      .from("pets")
      .update({
        name: editPetData.name.trim(),
        species: editPetData.species || selectedPet.species,
        breed: editPetData.breed || selectedPet.breed,
        age:
          editPetData.age !== undefined
            ? parseInt(editPetData.age) || null
            : selectedPet.age,
        age_unit: editPetData.age_unit || selectedPet.age_unit || "Years",
      })
      .eq("id", selectedPet.id);

    if (!error) {
      toast.success("Pet updated!");
      setIsEditingPet(false);
      setSelectedPet((prev) => ({
        ...prev,
        ...editPetData,
        name: editPetData.name.trim(),
      }));
      if (fetchPets) fetchPets();
    } else {
      toast.error("Failed to update pet: " + error.message);
    }
  };

  return (
    <>
      <div className="lg:col-span-1 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <PawPrint size={20} className="text-slate-700" /> My Companions
          </h2>
          <button
            onClick={() => setIsAddPetOpen(true)}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {myPets.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <PawPrint size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-sm">No pets registered yet</p>
              </div>
            ) : (
              myPets.map((pet, i) => {
                const petShortId = pet.short_id
                  ? shortId(pet.short_id, "PET")
                  : `PET-${String(i + 1).padStart(2, "0")}`;
                return (
                  <div
                    key={pet.id}
                    onClick={() => setSelectedPet(pet)}
                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm overflow-hidden ${
                          i % 3 === 0
                            ? "bg-rose-500"
                            : i % 3 === 1
                              ? "bg-blue-500"
                              : "bg-teal-500"
                        }`}
                      >
                        {pet.avatar_url ? (
                          <img
                            src={pet.avatar_url}
                            alt={pet.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{pet.name[0]}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 leading-tight">
                            {pet.name}
                          </p>
                          <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                            {petShortId}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {pet.species} • {formatAge(pet.age, pet.age_unit)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-slate-300 group-hover:text-slate-600 transition-colors"
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* View Pet Details Modal */}
      {selectedPet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => handleDeletePet(selectedPet.id)}
              className="absolute top-6 left-6 w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 hover:bg-rose-100 hover:text-rose-600 transition-colors"
              title="Delete Pet"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={() => {
                setIsEditingPet(false);
                setSelectedPet(null);
              }}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col items-center text-center mt-4">
              <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-4xl mb-3 shadow-sm border-[6px] border-white ring-1 ring-slate-100 overflow-hidden relative">
                {selectedPet.avatar_url ? (
                  <img
                    src={selectedPet.avatar_url}
                    alt={selectedPet.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{selectedPet.name[0]?.toLowerCase()}</span>
                )}
              </div>
              <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest mb-2 shadow-sm border border-slate-200">
                {selectedPet.short_id
                  ? shortId(selectedPet.short_id, "PET")
                  : `PET-${selectedPet.id.substring(0, 4).toUpperCase()}`}
              </span>

              {isEditingPet ? (
                <div className="w-full text-left mt-2 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Name
                    </label>
                    <input
                      value={editPetData.name ?? selectedPet.name}
                      onChange={(e) =>
                        setEditPetData((p) => ({ ...p, name: e.target.value }))
                      }
                      className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Species
                      </label>
                      <select
                        value={editPetData.species ?? selectedPet.species}
                        onChange={(e) =>
                          setEditPetData((p) => ({
                            ...p,
                            species: e.target.value,
                          }))
                        }
                        className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>Dog</option>
                        <option>Cat</option>
                        <option>Bird</option>
                        <option>Rabbit</option>
                        <option>Fish</option>
                        <option>Reptile</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Breed
                      </label>
                      <input
                        value={editPetData.breed ?? selectedPet.breed ?? ""}
                        onChange={(e) =>
                          setEditPetData((p) => ({
                            ...p,
                            breed: e.target.value,
                          }))
                        }
                        className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Mixed"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Age
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="40"
                        value={editPetData.age ?? selectedPet.age ?? ""}
                        onChange={(e) =>
                          setEditPetData((p) => ({ ...p, age: e.target.value }))
                        }
                        className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Unit
                      </label>
                      <select
                        value={
                          editPetData.age_unit ??
                          selectedPet.age_unit ??
                          "Years"
                        }
                        onChange={(e) =>
                          setEditPetData((p) => ({
                            ...p,
                            age_unit: e.target.value,
                          }))
                        }
                        className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>Years</option>
                        <option>Months</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setIsEditingPet(false)}
                      className="flex-1 border border-slate-200 text-slate-600 font-bold py-3 rounded-2xl hover:bg-slate-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSavePet}
                      className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-2xl hover:bg-blue-700 transition-colors text-sm shadow-md"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-3xl font-black text-slate-900">
                    {selectedPet.name.toLowerCase()}
                  </h3>
                  <p className="text-slate-500 text-sm mt-2 flex items-center justify-center gap-1.5 font-medium">
                    <PawPrint size={14} className="text-slate-400" />{" "}
                    {selectedPet.species} • {selectedPet.breed || "Mixed"}
                  </p>

                  <div className="grid grid-cols-2 gap-4 w-full mt-8">
                    <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 text-center flex flex-col justify-center">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                        Age
                      </div>
                      <div className="text-lg font-black text-slate-800">
                        {formatAge(selectedPet.age, selectedPet.age_unit)}
                      </div>
                    </div>
                    <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 text-center flex flex-col justify-center">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                        Species
                      </div>
                      <div className="text-sm font-bold text-slate-700">
                        {selectedPet.species}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full mt-4">
                    <button
                      onClick={() => {
                        setIsEditingPet(true);
                        setEditPetData({
                          name: selectedPet.name,
                          species: selectedPet.species,
                          breed: selectedPet.breed || "",
                          age: selectedPet.age || "",
                          age_unit: selectedPet.age_unit || "Years",
                        });
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 font-bold py-3.5 rounded-2xl hover:bg-blue-100 transition-colors shadow-sm text-sm"
                    >
                      <Edit3 size={14} /> Edit Pet
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingPet(false);
                        setSelectedPet(null);
                      }}
                      className="flex-1 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-700 font-bold py-3.5 rounded-2xl transition-colors shadow-sm text-sm"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Pet Modal */}
      {isAddPetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-xl relative animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Register Pet
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Add a new companion to your profile
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddPetOpen(false);
                  setPetImagePreview(null);
                  setPetImageFile(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddPet} className="space-y-4">
              {/* Pet Profile Image Upload or Cropper */}
              {isCropping ? (
                <div className="flex flex-col items-center">
                  <div className="relative w-full h-64 bg-slate-900 rounded-xl overflow-hidden mb-4">
                    <Cropper
                      image={petImagePreview}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      cropShape="round"
                      showGrid={false}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                    />
                  </div>
                  <div className="w-full flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCropping(false)}
                      className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-xl text-sm font-bold hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCropSave}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-blue-700"
                    >
                      Crop & Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center mb-6">
                  <div
                    onClick={() => fileInputRef.current.click()}
                    className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all overflow-hidden relative group"
                  >
                    {petImagePreview ? (
                      <img
                        src={petImagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-blue-500">
                        <Plus size={24} />
                        <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">
                          Photo
                        </span>
                      </div>
                    )}
                    {petImagePreview && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-bold">
                          Change
                        </span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Pet's Name
                </label>
                <input
                  required
                  type="text"
                  value={newPet.name}
                  onChange={(e) =>
                    setNewPet({ ...newPet, name: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="e.g. Bella"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Species
                  </label>
                  <div className="relative">
                    <select
                      value={newPet.species}
                      onChange={(e) =>
                        setNewPet({ ...newPet, species: e.target.value })
                      }
                      className="w-full bg-white border border-slate-300 rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                    >
                      <option>Dog</option>
                      <option>Cat</option>
                      <option>Bird</option>
                      <option>Rabbit</option>
                      <option>Other</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Age
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="40"
                      value={newPet.age}
                      onChange={(e) =>
                        setNewPet({ ...newPet, age: e.target.value })
                      }
                      className="w-1/2 bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-center"
                      placeholder="e.g. 3"
                    />
                    <div className="relative w-1/2">
                      <select
                        value={newPet.ageUnit}
                        onChange={(e) =>
                          setNewPet({ ...newPet, ageUnit: e.target.value })
                        }
                        className="w-full bg-white border border-slate-300 rounded-xl pl-3 pr-8 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                      >
                        <option>Years</option>
                        <option>Months</option>
                      </select>
                      <ChevronDown
                        size={12}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Breed (Optional)
                </label>
                <input
                  type="text"
                  value={newPet.breed}
                  onChange={(e) =>
                    setNewPet({ ...newPet, breed: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="e.g. Golden Retriever"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmittingPet}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm mt-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {isSubmittingPet ? "Saving..." : "Save Companion"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
