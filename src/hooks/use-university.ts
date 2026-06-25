import { useEffect, useState } from "react";
import { getSavedUniversityId, getUniversityById, saveUniversityId } from "@/lib/universities";

export function useUniversity() {
  const [id, setId] = useState<string | null>(() => getSavedUniversityId());

  useEffect(() => {
    const onChange = () => setId(getSavedUniversityId());
    window.addEventListener("maqar:university", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("maqar:university", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return {
    universityId: id,
    university: getUniversityById(id),
    setUniversity: (newId: string | null) => {
      saveUniversityId(newId);
      setId(newId);
    },
  };
}
