import app from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

const firebase = app.initializeApp(firebaseConfig);
export default firebase;



import { createClient } from '@supabase/supabase-js'

const supabaseUrl = ''
const supabaseKey = ""
const supabase = createClient(supabaseUrl, supabaseKey)
export {supabase};
