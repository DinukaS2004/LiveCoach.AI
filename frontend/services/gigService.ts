// process.env looks at your .env file automatically
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const publishGig = async (gigData: any, token: string) => {
  try {
    // Now it uses whatever is in the .env file
    const response = await fetch(`${BASE_URL}api/gigs/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(gigData),
    });

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: "Network error" };
  }
};

export const getAllGigs = async () => {
  try {
    const response = await fetch(`${BASE_URL}api/gigs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return await response.json();
  } catch (error) {
    console.error("Fetch Error:", error);
    return { success: false, data: [] };
  }
};


export const deleteMyGig = async (token: string) => {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/gigs/delete`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    return await response.json();
  } catch (error) {
    console.error("Delete API Error:", error);
    return { success: false, message: "Network error" };
  }
};



export const updateGig = async (gigData: any, token: string) => {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/gigs/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(gigData),
    });

    return await response.json();
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false, message: "Network error" };
  }
};