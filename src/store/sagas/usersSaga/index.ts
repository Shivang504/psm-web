import { takeLatest } from 'redux-saga/effects'
import { sagaActions } from '@/store/actions'
import { genericSaga } from '@/store/sagas/genericSaga/genericSaga'

export function* usersSaga() {
  yield takeLatest(sagaActions.GET_USERS, genericSaga)
  yield takeLatest(sagaActions.GET_DESIGNATIONS, genericSaga)
  yield takeLatest(sagaActions.GET_ROLES, genericSaga)
  yield takeLatest(sagaActions.GET_REGIONS, genericSaga)
  yield takeLatest(sagaActions.GET_TERRITORIES, genericSaga)
  yield takeLatest(sagaActions.GET_EMPLOYEE, genericSaga)
  yield takeLatest(sagaActions.CREATE_EMPLOYEE, genericSaga)
  yield takeLatest(sagaActions.UPDATE_EMPLOYEE, genericSaga)
  yield takeLatest(sagaActions.UPDATE_EMPLOYEE_DESIGNATION, genericSaga)
  yield takeLatest(sagaActions.UPDATE_EMPLOYEE_STATUS, genericSaga)
  yield takeLatest(sagaActions.DELETE_EMPLOYEE, genericSaga)
  yield takeLatest(sagaActions.GET_EMPLOYEE_ACTIVITY, genericSaga)
  yield takeLatest(sagaActions.GET_EMPLOYEE_TRACKING, genericSaga)
  yield takeLatest(sagaActions.GET_EMPLOYEE_DISCUSSION, genericSaga)
  yield takeLatest(sagaActions.GET_EMPLOYEE_FOLLOWUPS, genericSaga)
  yield takeLatest(sagaActions.GET_EMPLOYEE_ORDERS, genericSaga)
}
