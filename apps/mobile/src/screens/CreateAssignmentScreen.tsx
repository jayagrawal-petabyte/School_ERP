import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";

import * as DocumentPicker from "expo-document-picker";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import assignmentApi from "../services/assignmentApi";
import {COLORS,SPACING,FONT_SIZE,FONT_WEIGHT,SHADOWS,} from "../constants/theme";

type CreateAssignmentRouteProp = RouteProp<RootStackParamList, "CreateAssignment">;
type CreateAssignmentNavigationProp = NativeStackNavigationProp<RootStackParamList, "CreateAssignment">;

interface Props {
  route: CreateAssignmentRouteProp;
  navigation: CreateAssignmentNavigationProp;
}

export default function CreateAssignmentScreen({navigation,}: Props) {
    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("");
    const [className, setClassName] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [maxMarks, setMaxMarks] = useState("");
    const [attachedFile, setAttachedFile] = useState<{uri:string; name:string; type:string; size?:number;}|null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePickDocument = async()=>{
        try{
            const result = await DocumentPicker.getDocumentAsync({
                type:[
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "image/*"],
                    copyToCacheDirectory:true
            });

        if(result.canceled){return;}

        const file = result.assets[0];
        setAttachedFile({uri:file.uri, name:file.name, type:file.mimeType || "application/octet-stream", size:file.size});
        }catch(error){
            console.log(error);
            Alert.alert("Error", "Unable to select file.");
        }
    };

    const handleRemoveAttachment = ()=>{
        setAttachedFile(null);
    };

    const validateForm = ()=>{
        if(!title.trim()){
            Alert.alert("Validation", "Please enter assignment title.");
            return false;
        }

        if(!subject.trim()){
            Alert.alert("Validation", "Please enter subject.");
            return false;
        }

        if(!className.trim()){
            Alert.alert("Validation", "Please enter class.");
            return false;
        }

        if(!description.trim()){
            Alert.alert("Validation", "Please enter description.");
            return false;
        }

        if(!dueDate.trim()){
            Alert.alert("Validation", "Please enter due date.");
            return false;
        }

        if(!maxMarks.trim()){
            Alert.alert("Validation", "Please enter maximum marks.");
            return false;
        }

        return true;
    };

    const handleCreateAssignment = async()=>{
        if(!validateForm()){
            return;
        }
        setIsSubmitting(true);
        try{
            await assignmentApi.createAssignment({title, subject, className, description, dueDate,});
            await assignmentApi.createAssignment({title, subject, className, description, dueDate, maxMarks:Number(maxMarks), referenceFile: attachedFile,});
            Alert.alert("Success", "Assignment created successfully.", [{
                text:"OK", onPress:()=>{
                    navigation.goBack();
                }
            }]);

        }catch(error){
            console.log(error);
            Alert.alert("Error", "Unable to create assignment.");
        }finally{
            setIsSubmitting(false);
        }
    };

    const formatFileSize = (size?:number)=>{
        if(!size){
            return "";
        }
        return `${(size/1024/1024).toFixed(2)} MB`;
    };

    return (
        <SafeAreaView style={styles.container}>
        <StatusBar
            barStyle="dark-content"
            backgroundColor="#FFFFFF"
        />

        <View style={styles.customHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}
      >     <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Assignment</Text>
        <View style={{ width: 38 }} /></View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={styles.card}>
        <Text style={styles.sectionTitle}>Assignment Details</Text>
        <View style={styles.formGroup}>
            <Text style={styles.label}>Assignment Title</Text>
            <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter assignment title"
                placeholderTextColor={COLORS.textMuted}
            />
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Subject</Text>
            <TextInput
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
                placeholder="Mathematics"
                placeholderTextColor={COLORS.textMuted}
            />
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Class</Text>
            <TextInput
                style={styles.input}
                value={className}
                onChangeText={setClassName}
                placeholder="10-A"
                placeholderTextColor={COLORS.textMuted}
            />
        </View>

        <View style={styles.row}>
            <View style={styles.halfField}>
            <Text style={styles.label}>Due Date</Text>
            <TextInput
                style={styles.input}
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="25 Jul 2026"
                placeholderTextColor={COLORS.textMuted}
            />
        </View>

        <View style={styles.halfField}>
            <Text style={styles.label}>Max Marks</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={maxMarks}
                onChangeText={setMaxMarks}
                placeholder="100"
                placeholderTextColor={COLORS.textMuted}
            />
        </View>
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={5}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter assignment description..."
                placeholderTextColor={COLORS.textMuted}
            />
        </View>
        </View>

        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Reference Material</Text>
            {!attachedFile ? (
                <TouchableOpacity style={styles.uploadCard} onPress={handlePickDocument}>
                    <Text style={styles.uploadIcon}>📎</Text>
                    <Text style={styles.uploadTitle}>Upload Reference File</Text>
                    <Text style={styles.uploadSubtitle}>PDF, Word or Image</Text>
                </TouchableOpacity>
            ) : (

            <View style={styles.fileCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fileName} numberOfLines={1}>{attachedFile.name}</Text>
              <Text style={styles.fileSize}>{formatFileSize(attachedFile.size)}</Text>
            </View>

            <TouchableOpacity onPress={handleRemoveAttachment}>
                <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
            </View>
            )}
        </View>

        <TouchableOpacity style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled,]}
            disabled={isSubmitting} onPress={handleCreateAssignment}
        >
            {isSubmitting ? (<ActivityIndicator color={COLORS.textLight}/>
            ) : (
                <Text style={styles.submitButtonText}>Create Assignment</Text>
            )}
        </TouchableOpacity>
        </ScrollView>
    </SafeAreaView>
    );
    }

const styles = StyleSheet.create({
      container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop:
      Platform.OS === "android"
        ? StatusBar.currentHeight
        : 0,
  },

  content: {
    padding: SPACING.lg,
    paddingBottom: 120,
  },

  customHeader: {
    height: 56,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backButton: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 19,
  },

  backButtonText: {
    fontSize: 22,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },

  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },

  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },

  formGroup: {
    marginBottom: SPACING.md,
  },

  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },

  input: {
    height: 48,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
  },

  textArea: {
    minHeight: 120,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    textAlignVertical: "top",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.md,
  },

  halfField: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },

    uploadCard: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    borderRadius: 12,
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  uploadIcon: {
    fontSize: 36,
    marginBottom: SPACING.sm,
  },

  uploadTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    textAlign: "center",
  },

  uploadSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: "center",
  },

  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: SPACING.md,
  },

  fileName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },

  fileSize: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  removeText: {
    color: COLORS.absent,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    paddingHorizontal: SPACING.sm,
  },

  submitButton: {
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },

  submitButtonDisabled: {
    opacity: 0.6,
  },

  submitButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
});
});
