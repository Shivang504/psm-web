import { takeLatest } from 'redux-saga/effects'
import { sagaActions } from '@/store/actions'
import { genericSaga } from '@/store/sagas/genericSaga/genericSaga'

export function* profileSaga() {
  yield takeLatest(sagaActions.GET_PROFILE, genericSaga)
  yield takeLatest(sagaActions.UPDATE_PROFILE, genericSaga)
}
