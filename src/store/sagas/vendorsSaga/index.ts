import { takeLatest } from 'redux-saga/effects'
import { sagaActions } from '@/store/actions'
import { genericSaga } from '@/store/sagas/genericSaga/genericSaga'

export function* vendorsSaga() {
  yield takeLatest(sagaActions.GET_VENDORS, genericSaga)
  yield takeLatest(sagaActions.GET_VENDOR, genericSaga)
  yield takeLatest(sagaActions.CREATE_VENDOR, genericSaga)
  yield takeLatest(sagaActions.UPDATE_VENDOR, genericSaga)
  yield takeLatest(sagaActions.DELETE_VENDOR, genericSaga)
  yield takeLatest(sagaActions.GET_VENDOR_ORDERS, genericSaga)
}
