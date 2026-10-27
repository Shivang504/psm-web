import { takeLatest } from 'redux-saga/effects'
import { sagaActions } from '@/store/actions'
import { genericSaga } from '@/store/sagas/genericSaga/genericSaga'

export function* attendanceSaga() {
  yield takeLatest(sagaActions.GET_EMPLOYEE_ATTENDANCE, genericSaga)
  yield takeLatest(sagaActions.GET_EMPLOYEE_ATTENDANCE_EXPORT, genericSaga)
}
