import { takeLatest } from 'redux-saga/effects'
import { sagaActions } from '@/store/actions'
import { genericSaga } from '@/store/sagas/genericSaga/genericSaga'

export function* authSaga() {
  yield takeLatest(sagaActions.SEND_OTP, genericSaga)
  yield takeLatest(sagaActions.LOGIN, genericSaga)
  yield takeLatest(sagaActions.VERIFY_OTP, genericSaga)
  yield takeLatest(sagaActions.RESEND_OTP, genericSaga)
}
