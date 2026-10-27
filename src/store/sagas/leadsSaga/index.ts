import { takeLatest } from 'redux-saga/effects'
import { sagaActions } from '@/store/actions'
import { genericSaga } from '@/store/sagas/genericSaga/genericSaga'

export function* leadsSaga() {
  yield takeLatest(sagaActions.GET_LEADS, genericSaga)
  yield takeLatest(sagaActions.GET_LEAD, genericSaga)
  yield takeLatest(sagaActions.ADD_LEAD, genericSaga)
  yield takeLatest(sagaActions.EDIT_LEAD, genericSaga)
  yield takeLatest(sagaActions.DELETE_LEAD, genericSaga)
  yield takeLatest(sagaActions.APPROVE_LEAD, genericSaga)
  yield takeLatest(sagaActions.REJECT_LEAD, genericSaga)
  yield takeLatest(sagaActions.ASSIGN_LEAD, genericSaga)
  yield takeLatest(sagaActions.GET_PRODUCTS, genericSaga)
}
