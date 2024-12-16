import app from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
const firebaseConfig = {
  apiKey: "AIzaSyDiq2xbFCevTNtMFw9c6ZWWoFO3AOnNRP0",
  authDomain: "whatsappclone-bf545.firebaseapp.com",
  databaseURL: "https://whatsappclone-bf545-default-rtdb.firebaseio.com",
  projectId: "whatsappclone-bf545",
  storageBucket: "whatsappclone-bf545.firebasestorage.app",
  messagingSenderId: "940645215764",
  appId: "1:940645215764:web:cb9e6b3972286470e18101",
  measurementId: "G-TP2BLH4RM0"
};

const firebase = app.initializeApp(firebaseConfig);
export default firebase;



import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ycnunrrfuxkxfzggaqwf.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljbnVucnJmdXhreGZ6Z2dhcXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3MDY4ODEsImV4cCI6MjA0ODI4Mjg4MX0.N_dOyawE008QgSU0-Yd_YWW0iRwMj3bU90tNq4N5lQ0"
const supabase = createClient(supabaseUrl, supabaseKey)
export {supabase};