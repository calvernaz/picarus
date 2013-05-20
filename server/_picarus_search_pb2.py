# Generated by the protocol buffer compiler.  DO NOT EDIT!

from google.protobuf import descriptor
from google.protobuf import message
from google.protobuf import reflection
from google.protobuf import descriptor_pb2
# @@protoc_insertion_point(imports)



DESCRIPTOR = descriptor.FileDescriptor(
  name='picarus_search.proto',
  package='',
  serialized_pb='\n\x14picarus_search.proto\"\xcb\x03\n\x0bSearchIndex\x12\x0c\n\x04name\x18\x01 \x01(\x0c\x12@\n\x13preprocessor_format\x18\x02 \x01(\x0e\x32\x16.SearchIndex.SerFormat:\x0bJSON_IMPORT\x12;\n\x0e\x66\x65\x61ture_format\x18\x03 \x01(\x0e\x32\x16.SearchIndex.SerFormat:\x0bJSON_IMPORT\x12\x38\n\x0bhash_format\x18\x04 \x01(\x0e\x32\x16.SearchIndex.SerFormat:\x0bJSON_IMPORT\x12\x39\n\x0cindex_format\x18\x05 \x01(\x0e\x32\x16.SearchIndex.SerFormat:\x0bJSON_IMPORT\x12\x15\n\rcreation_time\x18\x06 \x01(\x01\x12\x10\n\x08part_num\x18\x07 \x01(\x05\x12\x11\n\tnum_parts\x18\x08 \x01(\x05\x12\x14\n\x0cpreprocessor\x18\t \x01(\x0c\x12\x0f\n\x07\x66\x65\x61ture\x18\n \x01(\x0c\x12\x0c\n\x04hash\x18\x0b \x01(\x0c\x12\r\n\x05index\x18\x0c \x01(\x0c\x12\x10\n\x08metadata\x18\r \x03(\x0c\"(\n\tSerFormat\x12\x0f\n\x0bJSON_IMPORT\x10\x00\x12\n\n\x06PICKLE\x10\x01\"\x98\x04\n\nClassifier\x12?\n\x13preprocessor_format\x18\x01 \x01(\x0e\x32\x15.Classifier.SerFormat:\x0bJSON_IMPORT\x12:\n\x0e\x66\x65\x61ture_format\x18\x02 \x01(\x0e\x32\x15.Classifier.SerFormat:\x0bJSON_IMPORT\x12=\n\x11\x63lassifier_format\x18\x03 \x01(\x0e\x32\x15.Classifier.SerFormat:\x0bJSON_IMPORT\x12\x0f\n\x07\x66\x65\x61ture\x18\x04 \x01(\x0c\x12\x12\n\nclassifier\x18\x05 \x01(\x0c\x12\x14\n\x0cpreprocessor\x18\x06 \x01(\x0c\x12-\n\x0c\x66\x65\x61ture_type\x18\x07 \x01(\x0e\x32\x17.Classifier.FeatureType\x12\x33\n\x0f\x63lassifier_type\x18\x08 \x01(\x0e\x32\x1a.Classifier.ClassifierType\"(\n\tSerFormat\x12\x0f\n\x0bJSON_IMPORT\x10\x00\x12\n\n\x06PICKLE\x10\x01\"?\n\x0b\x46\x65\x61tureType\x12\x0b\n\x07\x46\x45\x41TURE\x10\x00\x12\x11\n\rMULTI_FEATURE\x10\x01\x12\x10\n\x0cMASK_FEATURE\x10\x02\"D\n\x0e\x43lassifierType\x12\x19\n\x15SKLEARN_DECISION_FUNC\x10\x00\x12\x17\n\x13\x43LASS_DISTANCE_LIST\x10\x01\"5\n\x07NDArray\x12\x0c\n\x04\x64\x61ta\x18\x01 \x02(\x0c\x12\r\n\x05shape\x18\x02 \x03(\x05\x12\r\n\x05\x64type\x18\x03 \x02(\t')



_SEARCHINDEX_SERFORMAT = descriptor.EnumDescriptor(
  name='SerFormat',
  full_name='SearchIndex.SerFormat',
  filename=None,
  file=DESCRIPTOR,
  values=[
    descriptor.EnumValueDescriptor(
      name='JSON_IMPORT', index=0, number=0,
      options=None,
      type=None),
    descriptor.EnumValueDescriptor(
      name='PICKLE', index=1, number=1,
      options=None,
      type=None),
  ],
  containing_type=None,
  options=None,
  serialized_start=444,
  serialized_end=484,
)

_CLASSIFIER_SERFORMAT = descriptor.EnumDescriptor(
  name='SerFormat',
  full_name='Classifier.SerFormat',
  filename=None,
  file=DESCRIPTOR,
  values=[
    descriptor.EnumValueDescriptor(
      name='JSON_IMPORT', index=0, number=0,
      options=None,
      type=None),
    descriptor.EnumValueDescriptor(
      name='PICKLE', index=1, number=1,
      options=None,
      type=None),
  ],
  containing_type=None,
  options=None,
  serialized_start=444,
  serialized_end=484,
)

_CLASSIFIER_FEATURETYPE = descriptor.EnumDescriptor(
  name='FeatureType',
  full_name='Classifier.FeatureType',
  filename=None,
  file=DESCRIPTOR,
  values=[
    descriptor.EnumValueDescriptor(
      name='FEATURE', index=0, number=0,
      options=None,
      type=None),
    descriptor.EnumValueDescriptor(
      name='MULTI_FEATURE', index=1, number=1,
      options=None,
      type=None),
    descriptor.EnumValueDescriptor(
      name='MASK_FEATURE', index=2, number=2,
      options=None,
      type=None),
  ],
  containing_type=None,
  options=None,
  serialized_start=890,
  serialized_end=953,
)

_CLASSIFIER_CLASSIFIERTYPE = descriptor.EnumDescriptor(
  name='ClassifierType',
  full_name='Classifier.ClassifierType',
  filename=None,
  file=DESCRIPTOR,
  values=[
    descriptor.EnumValueDescriptor(
      name='SKLEARN_DECISION_FUNC', index=0, number=0,
      options=None,
      type=None),
    descriptor.EnumValueDescriptor(
      name='CLASS_DISTANCE_LIST', index=1, number=1,
      options=None,
      type=None),
  ],
  containing_type=None,
  options=None,
  serialized_start=955,
  serialized_end=1023,
)


_SEARCHINDEX = descriptor.Descriptor(
  name='SearchIndex',
  full_name='SearchIndex',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    descriptor.FieldDescriptor(
      name='name', full_name='SearchIndex.name', index=0,
      number=1, type=12, cpp_type=9, label=1,
      has_default_value=False, default_value="",
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='preprocessor_format', full_name='SearchIndex.preprocessor_format', index=1,
      number=2, type=14, cpp_type=8, label=1,
      has_default_value=True, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='feature_format', full_name='SearchIndex.feature_format', index=2,
      number=3, type=14, cpp_type=8, label=1,
      has_default_value=True, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='hash_format', full_name='SearchIndex.hash_format', index=3,
      number=4, type=14, cpp_type=8, label=1,
      has_default_value=True, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='index_format', full_name='SearchIndex.index_format', index=4,
      number=5, type=14, cpp_type=8, label=1,
      has_default_value=True, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='creation_time', full_name='SearchIndex.creation_time', index=5,
      number=6, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='part_num', full_name='SearchIndex.part_num', index=6,
      number=7, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='num_parts', full_name='SearchIndex.num_parts', index=7,
      number=8, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='preprocessor', full_name='SearchIndex.preprocessor', index=8,
      number=9, type=12, cpp_type=9, label=1,
      has_default_value=False, default_value="",
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='feature', full_name='SearchIndex.feature', index=9,
      number=10, type=12, cpp_type=9, label=1,
      has_default_value=False, default_value="",
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='hash', full_name='SearchIndex.hash', index=10,
      number=11, type=12, cpp_type=9, label=1,
      has_default_value=False, default_value="",
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='index', full_name='SearchIndex.index', index=11,
      number=12, type=12, cpp_type=9, label=1,
      has_default_value=False, default_value="",
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='metadata', full_name='SearchIndex.metadata', index=12,
      number=13, type=12, cpp_type=9, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
    _SEARCHINDEX_SERFORMAT,
  ],
  options=None,
  is_extendable=False,
  extension_ranges=[],
  serialized_start=25,
  serialized_end=484,
)


_CLASSIFIER = descriptor.Descriptor(
  name='Classifier',
  full_name='Classifier',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    descriptor.FieldDescriptor(
      name='preprocessor_format', full_name='Classifier.preprocessor_format', index=0,
      number=1, type=14, cpp_type=8, label=1,
      has_default_value=True, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='feature_format', full_name='Classifier.feature_format', index=1,
      number=2, type=14, cpp_type=8, label=1,
      has_default_value=True, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='classifier_format', full_name='Classifier.classifier_format', index=2,
      number=3, type=14, cpp_type=8, label=1,
      has_default_value=True, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='feature', full_name='Classifier.feature', index=3,
      number=4, type=12, cpp_type=9, label=1,
      has_default_value=False, default_value="",
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='classifier', full_name='Classifier.classifier', index=4,
      number=5, type=12, cpp_type=9, label=1,
      has_default_value=False, default_value="",
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='preprocessor', full_name='Classifier.preprocessor', index=5,
      number=6, type=12, cpp_type=9, label=1,
      has_default_value=False, default_value="",
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='feature_type', full_name='Classifier.feature_type', index=6,
      number=7, type=14, cpp_type=8, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='classifier_type', full_name='Classifier.classifier_type', index=7,
      number=8, type=14, cpp_type=8, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
    _CLASSIFIER_SERFORMAT,
    _CLASSIFIER_FEATURETYPE,
    _CLASSIFIER_CLASSIFIERTYPE,
  ],
  options=None,
  is_extendable=False,
  extension_ranges=[],
  serialized_start=487,
  serialized_end=1023,
)


_NDARRAY = descriptor.Descriptor(
  name='NDArray',
  full_name='NDArray',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    descriptor.FieldDescriptor(
      name='data', full_name='NDArray.data', index=0,
      number=1, type=12, cpp_type=9, label=2,
      has_default_value=False, default_value="",
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='shape', full_name='NDArray.shape', index=1,
      number=2, type=5, cpp_type=1, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='dtype', full_name='NDArray.dtype', index=2,
      number=3, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  options=None,
  is_extendable=False,
  extension_ranges=[],
  serialized_start=1025,
  serialized_end=1078,
)

_SEARCHINDEX.fields_by_name['preprocessor_format'].enum_type = _SEARCHINDEX_SERFORMAT
_SEARCHINDEX.fields_by_name['feature_format'].enum_type = _SEARCHINDEX_SERFORMAT
_SEARCHINDEX.fields_by_name['hash_format'].enum_type = _SEARCHINDEX_SERFORMAT
_SEARCHINDEX.fields_by_name['index_format'].enum_type = _SEARCHINDEX_SERFORMAT
_SEARCHINDEX_SERFORMAT.containing_type = _SEARCHINDEX;
_CLASSIFIER.fields_by_name['preprocessor_format'].enum_type = _CLASSIFIER_SERFORMAT
_CLASSIFIER.fields_by_name['feature_format'].enum_type = _CLASSIFIER_SERFORMAT
_CLASSIFIER.fields_by_name['classifier_format'].enum_type = _CLASSIFIER_SERFORMAT
_CLASSIFIER.fields_by_name['feature_type'].enum_type = _CLASSIFIER_FEATURETYPE
_CLASSIFIER.fields_by_name['classifier_type'].enum_type = _CLASSIFIER_CLASSIFIERTYPE
_CLASSIFIER_SERFORMAT.containing_type = _CLASSIFIER;
_CLASSIFIER_FEATURETYPE.containing_type = _CLASSIFIER;
_CLASSIFIER_CLASSIFIERTYPE.containing_type = _CLASSIFIER;
DESCRIPTOR.message_types_by_name['SearchIndex'] = _SEARCHINDEX
DESCRIPTOR.message_types_by_name['Classifier'] = _CLASSIFIER
DESCRIPTOR.message_types_by_name['NDArray'] = _NDARRAY

class SearchIndex(message.Message):
  __metaclass__ = reflection.GeneratedProtocolMessageType
  DESCRIPTOR = _SEARCHINDEX
  
  # @@protoc_insertion_point(class_scope:SearchIndex)

class Classifier(message.Message):
  __metaclass__ = reflection.GeneratedProtocolMessageType
  DESCRIPTOR = _CLASSIFIER
  
  # @@protoc_insertion_point(class_scope:Classifier)

class NDArray(message.Message):
  __metaclass__ = reflection.GeneratedProtocolMessageType
  DESCRIPTOR = _NDARRAY
  
  # @@protoc_insertion_point(class_scope:NDArray)

# @@protoc_insertion_point(module_scope)