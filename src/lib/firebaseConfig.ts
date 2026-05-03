import { initializeApp }  from 'firebase/app'
import { getAuth }        from 'firebase/auth'
import { getFirestore }   from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            'AIzaSyA-IyiL_RHQpX9l9NNw56FDlg0Uje-3BkM',
  authDomain:        'nida-learning-platform.firebaseapp.com',
  projectId:         'nida-learning-platform',
  storageBucket:     'nida-learning-platform.firebasestorage.app',
  messagingSenderId: '70621654650',
  appId:             '1:70621654650:web:a0d618242210d6ce4615c3',
  measurementId:     'G-7XKZTF68F4',
}

export const app  = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db   = getFirestore(app)
