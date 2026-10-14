// components/utils/resumeUploadHelper.js

export function buildResumeMultipartFormData(resume, pendingFiles = {}) {
  const formData = new FormData();
  const body = JSON.parse(JSON.stringify(resume || {}));

  // Clean transient editor properties
  delete body._id;
  delete body.avatar;
  delete body.themeColor;

  // 1. Attach Avatar if present
  if (pendingFiles.avatar) {
    formData.append("avatar", pendingFiles.avatar);
  }

  // 2. Process Certificates
  let certIndex = 0;
  const certificateFilesArray = [];
  if (body.certifications?.certificates) {
    for (const cert of Object.values(body.certifications.certificates)) {
      const localFileId = cert?.certificateContent?.fileId;

      // If a file was uploaded for this certificate, map it to fileIndex
      if (localFileId && pendingFiles[localFileId]) {
        certificateFilesArray.push(pendingFiles[localFileId]);
        cert.certificateContent = {
          fileIndex: certIndex++,
          title: pendingFiles[localFileId].name,
        };
        // Clear certificateUrl so it doesn't trigger URL validation errors when a file is uploaded
        delete cert.certificateUrl;
      } else {
        delete cert.certificateContent?.fileId;
        // If certificateUrl is empty string, delete it so the validator doesn't reject it as an invalid URL
        if (!cert.certificateUrl || typeof cert.certificateUrl !== "string" || cert.certificateUrl.trim() === "") {
          delete cert.certificateUrl;
        }
      }
    }
  }

  // 3. Process Publications
  let pubIndex = 0;
  const publicationFilesArray = [];
  if (body.publications?.publications) {
    for (const pub of Object.values(body.publications.publications)) {
      if (pub.referenceUrl && typeof pub.referenceUrl === "string" && pub.referenceUrl.trim() === "") {
        delete pub.referenceUrl;
      }
      if (Array.isArray(pub.publicationReference)) {
        pub.publicationReference = pub.publicationReference
          .map((ref) => {
            const localFileId = ref?.fileId;
            if (localFileId && pendingFiles[localFileId]) {
              publicationFilesArray.push(pendingFiles[localFileId]);
              return {
                fileIndex: pubIndex++,
                title: pendingFiles[localFileId].name,
              };
            }
            return null;
          })
          .filter(Boolean);
      }
    }
  }

  // 4. Process Awards & Achievements
  let achIndex = 0;
  const achievementFilesArray = [];
  if (Array.isArray(body.awardsAndAchievements?.achievements)) {
    body.awardsAndAchievements.achievements =
      body.awardsAndAchievements.achievements.map((ach) => {
        if (ach.url && typeof ach.url === "string" && ach.url.trim() === "") {
          delete ach.url;
        }
        if (Array.isArray(ach.documents)) {
          return {
            ...ach,
            documents: ach.documents
              .map((doc) => {
                const localFileId = doc?.fileId;
                if (localFileId && pendingFiles[localFileId]) {
                  achievementFilesArray.push(pendingFiles[localFileId]);
                  return {
                    fileIndex: achIndex++,
                    title: pendingFiles[localFileId].name,
                  };
                }
                return null;
              })
              .filter(Boolean),
          };
        }
        return ach;
      });
  }

  // Append files matching field.name definitions in resume.route.ts[cite: 28]
  certificateFilesArray.forEach((file) =>
    formData.append("certificateFiles", file),
  );
  publicationFilesArray.forEach((file) =>
    formData.append("publicationFiles", file),
  );
  achievementFilesArray.forEach((file) =>
    formData.append("achievementFiles", file),
  );

  // Append each top-level schema key individually to FormData
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined && value !== null) {
      formData.append(key, JSON.stringify(value));
    }
  }

  return formData;
}